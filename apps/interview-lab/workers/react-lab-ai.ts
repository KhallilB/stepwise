import { isRecord, parseReview, reviewSchema } from "../app/react-lab/coach";
import { findChallenge } from "../app/react-lab/curriculum";
import { maxCodeLength, maxNotesLength } from "../app/react-lab/progress";
import { reviewInstructions } from "../app/react-lab/review-prompt";

export type CoachConfig = {
  enabled: boolean;
  apiKey?: string;
  reviewProvider: "ollama" | "openai";
  speechProvider: "local" | "openai";
  model: string;
  speechModel: string;
  ollamaUrl: string | null;
  speechUrl: string | null;
};
type Provider = (input: string, init: RequestInit) => Promise<Response>;
const headers = { "content-type": "application/json", "cache-control": "no-store" };
const reply = (body: object, status = 200) =>
  new Response(JSON.stringify(body), { status, headers });
const failure = (message: string, status: number) => reply({ error: message }, status);

function loopbackBase(value: string): string | null {
  try {
    const url = new URL(value);
    if (
      url.protocol !== "http:" ||
      !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    )
      return null;
    return url.href.replace(/\/$/, "");
  } catch {
    return null;
  }
}

export function readCoachConfig(bindings: object, development: boolean): CoachConfig {
  const setting = (name: string, fallback = "") => {
    const value: unknown = Reflect.get(bindings, name);
    return typeof value === "string" && value.trim() ? value.trim() : fallback;
  };
  const reviewProvider = setting("REACT_LAB_REVIEW_PROVIDER") === "openai" ? "openai" : "ollama";
  const speechProvider = setting("REACT_LAB_SPEECH_PROVIDER") === "openai" ? "openai" : "local";
  return {
    enabled: development,
    apiKey: setting("OPENAI_API_KEY") || undefined,
    reviewProvider,
    speechProvider,
    model:
      reviewProvider === "ollama"
        ? setting("OLLAMA_REVIEW_MODEL", "devstral:24b")
        : setting("OPENAI_REVIEW_MODEL", "gpt-5-mini"),
    speechModel:
      speechProvider === "local"
        ? setting("LOCAL_TRANSCRIBE_MODEL", "Systran/faster-whisper-small")
        : "gpt-4o-mini-transcribe",
    ollamaUrl: loopbackBase(setting("OLLAMA_URL", "http://127.0.0.1:11434")),
    speechUrl: loopbackBase(setting("LOCAL_TRANSCRIBE_URL", "http://127.0.0.1:8000/v1")),
  };
}

async function localModelReady(
  provider: Provider,
  endpoint: string | null,
  model: string,
  ollama: boolean,
  signal: AbortSignal,
): Promise<boolean> {
  if (!endpoint || model.includes(":cloud")) return false;
  try {
    const response = await provider(`${endpoint}/${ollama ? "api/tags" : "models"}`, {
      method: "GET",
      redirect: "manual",
      signal: AbortSignal.any([signal, AbortSignal.timeout(3000)]),
    });
    if (!response.ok) return false;
    const data: unknown = JSON.parse(new TextDecoder().decode(await limitedBody(response, 80000)));
    if (!isRecord(data)) return false;
    const models = ollama ? data.models : data.data;
    return (
      Array.isArray(models) &&
      models.some(
        (item) => isRecord(item) && !item.remote_host && (ollama ? item.name : item.id) === model,
      )
    );
  } catch {
    return false;
  }
}

async function limitedBody(
  source: Request | Response,
  max: number,
): Promise<Uint8Array<ArrayBuffer>> {
  const reader = source.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > max) {
        await reader.cancel();
        throw new Error("Input exceeds the size limit.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const body = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.length;
  }
  return body;
}

// Fail closed: local development + same-origin POST + bounded validated input. No exemptions.
export async function handleCoachRequest(
  request: Request,
  config: CoachConfig,
  provider: Provider = fetch,
): Promise<Response> {
  const url = new URL(request.url);
  if (!config.enabled || !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname))
    return failure("Personal coaching is available only on the local dev server.", 404);
  const operation = url.pathname.split("/").at(-1);
  if (!["status", "review", "transcribe"].includes(operation ?? ""))
    return failure("Not found.", 404);
  if (operation === "status") {
    if (request.method !== "GET") return failure("Use GET for coach status.", 405);
    const [reviewReady, speechReady] = await Promise.all([
      config.reviewProvider === "openai"
        ? !!config.apiKey
        : localModelReady(provider, config.ollamaUrl, config.model, true, request.signal),
      config.speechProvider === "openai"
        ? !!config.apiKey
        : localModelReady(provider, config.speechUrl, config.speechModel, false, request.signal),
    ]);
    return reply({
      review: { ready: reviewReady, provider: config.reviewProvider, model: config.model },
      speech: { ready: speechReady, provider: config.speechProvider, model: config.speechModel },
    });
  }
  if (request.method !== "POST") return failure("Use POST for coaching.", 405);
  if (request.headers.get("origin") !== url.origin)
    return failure("Send coaching requests from the local lab.", 403);
  const cloud =
    operation === "review"
      ? config.reviewProvider === "openai"
      : config.speechProvider === "openai";
  if (cloud && !config.apiKey)
    return failure(
      "Set OPENAI_API_KEY in .dev.vars and restart the dev server for the selected cloud provider.",
      503,
    );
  if (
    !cloud &&
    (operation === "review"
      ? !config.ollamaUrl || config.model.includes(":cloud")
      : !config.speechUrl)
  )
    return failure(
      "Local providers require a loopback HTTP URL and a local model. Check .dev.vars.",
      503,
    );
  const auth: Record<string, string> = cloud ? { authorization: `Bearer ${config.apiKey}` } : {};
  try {
    let endpoint: string;
    let init: RequestInit;
    if (operation === "review") {
      let input: unknown;
      try {
        input = JSON.parse(new TextDecoder().decode(await limitedBody(request, 64000)));
      } catch {
        return failure("Review input must be valid JSON under 64 KB.", 400);
      }
      if (
        !isRecord(input) ||
        typeof input.challengeId !== "string" ||
        typeof input.code !== "string" ||
        !input.code.trim() ||
        input.code.length > maxCodeLength ||
        typeof input.explanation !== "string" ||
        input.explanation.length > maxNotesLength
      )
        return failure(
          "Choose a challenge and provide code within the field limits. Explanation is optional.",
          400,
        );
      const challenge = findChallenge(input.challengeId);
      if (!challenge) return failure("Unknown challenge.", 400);
      const stage = input.stage ?? 0;
      if (
        !Number.isInteger(stage) ||
        Number(stage) < 0 ||
        Number(stage) >= (challenge.stages?.length ?? 1)
      )
        return failure("Choose a valid build stage.", 400);
      const activeStage = challenge.stages?.[Number(stage)];
      endpoint = "https://api.openai.com/v1/responses";
      init = {
        method: "POST",
        headers: { ...auth, "content-type": "application/json" },
        body: JSON.stringify({
          model: config.model,
          store: false,
          max_output_tokens: 4500,
          reasoning: { effort: "low" },
          instructions: reviewInstructions,
          input: JSON.stringify({
            challenge: {
              title: challenge.title,
              brief: challenge.brief,
              requirements: challenge.stages
                ? challenge.stages.slice(0, Number(stage) + 1).flatMap((item) => item.constraints)
                : challenge.requirements,
              rubric: challenge.rubric,
              activeStage: activeStage ? { index: Number(stage), title: activeStage.title } : null,
            },
            code: input.code,
            explanation: input.explanation,
          }),
          text: {
            format: {
              type: "json_schema",
              name: "react_interview_review",
              strict: true,
              schema: reviewSchema,
            },
          },
        }),
      };
    } else {
      let form: FormData;
      try {
        const body = await limitedBody(request, 8 * 1024 * 1024);
        form = await new Response(body, {
          headers: { "content-type": request.headers.get("content-type") ?? "" },
        }).formData();
      } catch {
        return failure("Send a recording under 8 MB as multipart form data.", 400);
      }
      const audio = form.get("audio");
      if (
        !(audio instanceof File) ||
        audio.size === 0 ||
        !["audio/webm", "audio/mp4", "audio/ogg", "audio/wav"].includes(
          audio.type.split(";")[0] ?? "",
        )
      )
        return failure("Provide a nonempty WebM, MP4, Ogg, or WAV audio recording.", 400);
      const upload = new FormData();
      upload.set("file", audio, audio.name);
      upload.set("model", config.speechModel);
      upload.set("response_format", "json");
      upload.set(
        "prompt",
        "React, TypeScript, JSX, useState, useEffect, useMemo, reducer, closure, render, props, state, cleanup.",
      );
      endpoint = cloud
        ? "https://api.openai.com/v1/audio/transcriptions"
        : `${config.speechUrl}/audio/transcriptions`;
      init = { method: "POST", headers: auth, body: upload };
    }
    if (operation === "review" && !cloud) {
      const openai = JSON.parse(String(init.body));
      endpoint = `${config.ollamaUrl}/api/chat`;
      init.body = JSON.stringify({
        model: config.model,
        stream: false,
        format: reviewSchema,
        messages: [
          {
            role: "system",
            content:
              openai.instructions +
              " Return JSON matching this schema: " +
              JSON.stringify(reviewSchema),
          },
          { role: "user", content: openai.input },
        ],
        options: { temperature: 0.2, num_predict: 4500, num_ctx: 16384 },
        keep_alive: "5m",
      });
    }
    const signal = AbortSignal.any([request.signal, AbortSignal.timeout(cloud ? 60000 : 180000)]);
    const response = await provider(endpoint, { ...init, signal, redirect: "manual" });
    if (!response.ok)
      return failure(
        cloud
          ? "OpenAI could not complete this request. Check key, model access, and quota."
          : "Local model could not complete this request. Check the model server and selected model. Nothing was sent to a cloud provider.",
        502,
      );
    const output: unknown = JSON.parse(
      new TextDecoder().decode(await limitedBody(response, 80000)),
    );
    if (!isRecord(output)) return failure("Model returned an unreadable response. Retry.", 502);
    if (operation === "transcribe") {
      if (
        typeof output.text !== "string" ||
        !output.text.trim() ||
        output.text.length > maxNotesLength
      )
        return failure("No usable transcript returned. Try a shorter, clearer recording.", 502);
      return reply({ text: output.text });
    }
    let text: string;
    if (!cloud) {
      if (
        output.done !== true ||
        !isRecord(output.message) ||
        typeof output.message.content !== "string"
      )
        return failure("Local review did not finish. Retry; no score was recorded.", 502);
      text = output.message.content;
    } else {
      if (output.status !== "completed" || !Array.isArray(output.output))
        return failure("AI review did not finish. Retry; no score was recorded.", 502);
      text = output.output
        .flatMap((item) => (isRecord(item) && Array.isArray(item.content) ? item.content : []))
        .filter(
          (item) => isRecord(item) && item.type === "output_text" && typeof item.text === "string",
        )
        .map((item) => item.text)
        .join("");
    }
    let review: unknown;
    try {
      review = JSON.parse(text);
    } catch {
      return failure("AI review returned no valid assessment. Retry; no score was recorded.", 502);
    }
    const parsed = parseReview(review);
    if (!parsed)
      return failure(
        "AI review did not meet the rubric format. Retry; no score was recorded.",
        502,
      );
    return reply({ review: parsed, model: config.model });
  } catch (error) {
    if (error instanceof Error && ["TimeoutError", "AbortError"].includes(error.name))
      return failure(
        "Coaching request timed out or was canceled. Your draft is safe; retry when ready.",
        504,
      );
    return failure("Coaching service is unavailable. Your draft is safe; retry when ready.", 502);
  }
}
