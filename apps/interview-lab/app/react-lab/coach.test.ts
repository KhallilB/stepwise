import { describe, expect, it, vi } from "vitest";
import { handleCoachRequest, readCoachConfig } from "../../workers/react-lab-ai";
import { parseReview, reviewScore } from "./coach";

const sampleReview = {
  summary: "Correct update model; explain the queue more explicitly.",
  correctness: {
    score: 4,
    evidence: "Uses functional updates.",
    improve: "Cover reset after repeated clicks.",
  },
  reasoning: {
    score: 3,
    evidence: "Names closure capture.",
    improve: "Explain replacement versus updater composition.",
  },
  communication: {
    score: 4,
    evidence: "Explains the failure before the fix.",
    improve: "State an invariant first.",
  },
  tradeoffs: {
    score: 2,
    evidence: "Mentions batching only.",
    improve: "Compare one +3 updater with three +1 updaters.",
  },
  strengths: ["Identifies the captured value."],
  nextSteps: ["Predict a replacement followed by an updater."],
  followUp: "What happens when setCount(10) is queued between updaters?",
};
const config = readCoachConfig(
  {
    REACT_LAB_REVIEW_PROVIDER: "openai",
    REACT_LAB_SPEECH_PROVIDER: "openai",
    OPENAI_API_KEY: "test-key",
  },
  true,
);
const request = (body: object, origin = "http://localhost:5173") =>
  new Request("http://localhost:5173/api/react-lab/review", {
    method: "POST",
    headers: { origin, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
const input = {
  challengeId: "snapshot",
  code: "export default function App() { return null; }",
  explanation: "Three functional updates each consume the pending value.",
};

describe("AI coaching boundary", () => {
  it("validates score dimensions instead of trusting arbitrary model output", () => {
    const parsed = parseReview(sampleReview);
    expect(parsed).not.toBeNull();
    if (!parsed) throw new Error("Expected valid review");
    expect(reviewScore(parsed)).toBe(60);
    expect(
      parseReview({ ...sampleReview, correctness: { ...sampleReview.correctness, score: 9 } }),
    ).toBeNull();
    expect(parseReview({ ...sampleReview, nextSteps: [] })).toBeNull();
    expect(parseReview({ ...sampleReview, reasoning: null })).toBeNull();
  });
  it("fails closed outside development, cross-origin, or without credentials", async () => {
    expect((await handleCoachRequest(request(input), { ...config, enabled: false })).status).toBe(
      404,
    );
    expect(
      (await handleCoachRequest(request(input, "https://elsewhere.example"), config)).status,
    ).toBe(403);
    expect(
      (await handleCoachRequest(request(input), { ...config, apiKey: undefined })).status,
    ).toBe(503);
  });
  it("rejects unknown challenges, oversized input and invalid explanation types before provider calls", async () => {
    const provider = vi.fn();
    expect(
      (await handleCoachRequest(request({ ...input, challengeId: "unknown" }), config, provider))
        .status,
    ).toBe(400);
    expect(
      (await handleCoachRequest(request({ ...input, explanation: null }), config, provider)).status,
    ).toBe(400);
    expect(
      (await handleCoachRequest(request({ ...input, code: "x".repeat(30001) }), config, provider))
        .status,
    ).toBe(400);
    expect(provider).not.toHaveBeenCalled();
  });
  it("sends structured, non-stored review requests and validates provider response", async () => {
    const provider = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          status: "completed",
          output: [
            {
              type: "message",
              content: [{ type: "output_text", text: JSON.stringify(sampleReview) }],
            },
          ],
        }),
      ),
    );
    const response = await handleCoachRequest(request(input), config, provider);
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ review: sampleReview, model: "gpt-5-mini" });
    const init = provider.mock.calls[0]?.[1] as RequestInit;
    const sent = JSON.parse(String(init.body));
    expect(sent.store).toBe(false);
    expect(sent.text.format.type).toBe("json_schema");
    expect(sent.instructions).toContain("untrusted");
    expect(JSON.parse(sent.input).challenge).not.toHaveProperty("referenceExplanation");
    expect(JSON.stringify(sent)).not.toContain("test-key");
  });
  it("never turns refusal, invalid output or provider failure into a score", async () => {
    for (const body of [
      { status: "incomplete", output: [] },
      { status: "completed", output: [{ content: [{ type: "refusal", refusal: "No" }] }] },
      { status: "completed", output: [{ content: [{ type: "output_text", text: "{}" }] }] },
    ]) {
      expect(
        (
          await handleCoachRequest(
            request(input),
            config,
            async () => new Response(JSON.stringify(body)),
          )
        ).status,
      ).toBe(502);
    }
    expect(
      (
        await handleCoachRequest(
          request(input),
          config,
          async () => new Response("secret provider error", { status: 401 }),
        )
      ).status,
    ).toBe(502);
  });
});

it("uploads bounded audio as multipart without exposing credentials", async () => {
  const form = new FormData();
  form.set("audio", new Blob(["fixture"], { type: "audio/webm" }), "explanation.webm");
  const req = new Request("http://localhost:5173/api/react-lab/transcribe", {
    method: "POST",
    headers: { origin: "http://localhost:5173" },
    body: form,
  });
  const provider = vi
    .fn()
    .mockResolvedValue(new Response(JSON.stringify({ text: "State is a snapshot." })));
  const response = await handleCoachRequest(req, config, provider);
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ text: "State is a snapshot." });
  const init = provider.mock.calls[0]?.[1] as RequestInit;
  expect((init.body as FormData).get("model")).toBe("gpt-4o-mini-transcribe");
  expect((init.body as FormData).get("file")).toBeInstanceOf(File);
});

it("rejects unsupported audio, empty transcripts and canceled provider requests", async () => {
  const bad = new FormData();
  bad.set("audio", new Blob(["script"], { type: "text/html" }), "x.html");
  const badRequest = new Request("http://localhost:5173/api/react-lab/transcribe", {
    method: "POST",
    headers: { origin: "http://localhost:5173" },
    body: bad,
  });
  const provider = vi.fn();
  expect((await handleCoachRequest(badRequest, config, provider)).status).toBe(400);
  expect(provider).not.toHaveBeenCalled();
  const audio = new FormData();
  audio.set("audio", new Blob(["fixture"], { type: "audio/webm" }), "x.webm");
  const empty = new Request("http://localhost:5173/api/react-lab/transcribe", {
    method: "POST",
    headers: { origin: "http://localhost:5173" },
    body: audio,
  });
  expect(
    (await handleCoachRequest(empty, config, async () => new Response('{"text":""}'))).status,
  ).toBe(502);
  expect(
    (
      await handleCoachRequest(request(input), config, async () => {
        throw new DOMException("Aborted", "AbortError");
      })
    ).status,
  ).toBe(504);
});

it("grades only validated active-stage cumulative constraints", async () => {
  const provider = vi.fn().mockResolvedValue(
    new Response(
      JSON.stringify({
        status: "completed",
        output: [{ content: [{ type: "output_text", text: JSON.stringify(sampleReview) }] }],
      }),
    ),
  );
  const response = await handleCoachRequest(
    request({ ...input, challengeId: "build-directory", stage: 0 }),
    config,
    provider,
  );
  expect(response.status).toBe(200);
  const init = provider.mock.calls[0]?.[1] as RequestInit | undefined;
  const sent = JSON.parse(String(init?.body));
  const context = JSON.parse(sent.input).challenge;
  expect(context.activeStage).toEqual({ index: 0, title: "A useful baseline" });
  expect(context.requirements.join(" ")).not.toContain("Older responses");
  expect(
    (
      await handleCoachRequest(
        request({ ...input, challengeId: "build-directory", stage: 99 }),
        config,
        provider,
      )
    ).status,
  ).toBe(400);
});

it("keeps stage identity in saved feedback and ignores corrupt history", async () => {
  const { parseAttempts } = await import("./coach");
  const attempt = {
    code: "code",
    explanation: "why",
    stage: 1,
    model: "test-model",
    createdAt: "2026-10-29T12:00:00Z",
    review: sampleReview,
  };
  expect(parseAttempts(JSON.stringify([attempt]))[0]?.stage).toBe(1);
  expect(parseAttempts(JSON.stringify([{ ...attempt, stage: 99 }]))).toEqual([]);
  expect(parseAttempts("broken")).toEqual([]);
});

describe("local coaching", () => {
  it("defaults to local inference even with a cloud key present", () => {
    const local = readCoachConfig({ OPENAI_API_KEY: "do-not-send" }, true);
    expect(local.reviewProvider).toBe("ollama");
    expect(local.speechProvider).toBe("local");
  });
  it("sends structured reviews to loopback only, without cloud credentials or fallback", async () => {
    const local = readCoachConfig({ OPENAI_API_KEY: "do-not-send" }, true);
    const provider = vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({ done: true, message: { content: JSON.stringify(sampleReview) } }),
        ),
      );
    const response = await handleCoachRequest(request(input), local, provider);
    expect(response.status).toBe(200);
    expect(provider.mock.calls[0]?.[0]).toBe("http://127.0.0.1:11434/api/chat");
    const init = provider.mock.calls[0]?.[1] as RequestInit;
    expect(new Headers(init.headers).has("authorization")).toBe(false);
    expect(init.redirect).toBe("manual");
    const payload = JSON.parse(String(init.body));
    expect(payload.format.required).toContain("correctness");
    expect(payload.stream).toBe(false);
    const failed = vi.fn().mockRejectedValue(new Error("offline"));
    expect((await handleCoachRequest(request(input), local, failed)).status).toBe(502);
    expect(failed).toHaveBeenCalledTimes(1);
  });
  it("rejects non-loopback local endpoints before transmitting practice data", async () => {
    const local = readCoachConfig(
      { OLLAMA_URL: "https://remote.example", LOCAL_TRANSCRIBE_URL: "https://remote.example/v1" },
      true,
    );
    const provider = vi.fn();
    expect((await handleCoachRequest(request(input), local, provider)).status).toBe(503);
    expect(provider).not.toHaveBeenCalled();
  });
  it("keeps local review and speech availability independent", async () => {
    const local = readCoachConfig({}, true);
    const provider = vi.fn(async (url: string) =>
      url.endsWith("/api/tags")
        ? new Response(JSON.stringify({ models: [{ name: local.model }] }))
        : new Response("offline", { status: 503 }),
    );
    const response = await handleCoachRequest(
      new Request("http://localhost:5173/api/react-lab/status"),
      local,
      provider,
    );
    expect(await response.json()).toMatchObject({
      review: { ready: true, provider: "ollama" },
      speech: { ready: false, provider: "local" },
    });
  });
});

it("sends speech only to configured local transcription service and rejects redirects", async () => {
  const local = readCoachConfig({}, true);
  const form = new FormData();
  form.set("audio", new Blob(["fixture"], { type: "audio/webm" }), "explanation.webm");
  const req = () =>
    new Request("http://localhost:5173/api/react-lab/transcribe", {
      method: "POST",
      headers: { origin: "http://localhost:5173" },
      body: form,
    });
  const provider = vi
    .fn()
    .mockResolvedValue(new Response(JSON.stringify({ text: "Pending state composes." })));
  expect((await handleCoachRequest(req(), local, provider)).status).toBe(200);
  expect(provider.mock.calls[0]?.[0]).toBe("http://127.0.0.1:8000/v1/audio/transcriptions");
  const init = provider.mock.calls[0]?.[1] as RequestInit;
  expect((init.body as FormData).get("model")).toBe("Systran/faster-whisper-small");
  expect(new Headers(init.headers).has("authorization")).toBe(false);
  const redirect = vi
    .fn()
    .mockResolvedValue(
      new Response(null, { status: 307, headers: { location: "https://remote.example" } }),
    );
  expect((await handleCoachRequest(req(), local, redirect)).status).toBe(502);
  expect(redirect).toHaveBeenCalledTimes(1);
});

it("withholds the reference answer and asks for Socratic implementation coaching", async () => {
  const provider = vi.fn(
    async (_url: string | URL | Request, _init?: RequestInit) =>
      new Response(
        JSON.stringify({
          status: "completed",
          output: [{ content: [{ type: "output_text", text: JSON.stringify(sampleReview) }] }],
        }),
      ),
  );
  const response = await handleCoachRequest(
    request({ ...input, explanation: "" }),
    config,
    provider,
  );
  expect(response.status).toBe(200);
  const body = JSON.parse(provider.mock.calls[0]?.[1]?.body as string);
  expect(body.instructions).toContain("Do not provide the full answer");
  expect(body.instructions).toContain("Socratic");
  expect(JSON.parse(body.input).challenge).not.toHaveProperty("referenceExplanation");
  expect(body.input).not.toContain("setCount(c => c + 1)");
});

it("rejects model output containing a full component or fenced answer", () => {
  expect(
    parseReview({
      ...sampleReview,
      summary: "```tsx\nexport default function App() { return <p>answer</p>; }\n```",
    }),
  ).toBeNull();
});

it("keeps reset identity in saved coaching and rejects corrupt identities", async () => {
  const { parseAttempts } = await import("./coach");
  const attempt = {
    code: "draft",
    explanation: "",
    model: "local",
    createdAt: "2026-11-02T16:00:00Z",
    review: sampleReview,
    resetToken: "new-attempt",
  };
  expect(parseAttempts(JSON.stringify([attempt]))[0]?.resetToken).toBe("new-attempt");
  expect(parseAttempts(JSON.stringify([{ ...attempt, resetToken: 42 }]))).toEqual([]);
});
