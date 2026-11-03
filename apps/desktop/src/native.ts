import { invoke } from "@tauri-apps/api/core";
import { parseReview } from "../../interview-lab/app/react-lab/coach";
import { configureCoachTransport } from "../../interview-lab/app/react-lab/coach-transport";
export type LocalStatus = {
  phase: "starting" | "missing" | "downloading" | "reviewing" | "ready" | "failed";
  model: string;
  completed: number;
  total: number;
  error?: string;
  operationId?: string;
};
type NativeInvoke = (command: string, args?: Record<string, unknown>) => Promise<unknown>;
const reply = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
export function createDesktopCoach(call: NativeInvoke) {
  return async (url: string, init?: RequestInit): Promise<Response> => {
    try {
      if (url === "/api/react-lab/status") {
        const status = (await call("ollama_status")) as LocalStatus;
        return reply({
          review: { ready: status.phase === "ready", provider: "ollama", model: status.model },
          speech: { ready: false, provider: "local", model: "" },
        });
      }
      if (url !== "/api/react-lab/review")
        return reply(
          { error: "Desktop reviews use typed explanations. Speech transcription is not bundled." },
          503,
        );
      if (init?.method !== "POST" || typeof init.body !== "string")
        return reply({ error: "Invalid review request." }, 400);
      init.signal?.throwIfAborted();
      const { challengeId, code, explanation, stage } = JSON.parse(init.body);
      const requestId = crypto.randomUUID();
      const cancel = () => {
        void call("cancel_local_operation", { operationId: requestId }).catch(() => {});
      };
      init.signal?.addEventListener("abort", cancel, { once: true });
      try {
        const output = (await call("review_solution", {
          submission: { challengeId, code, explanation, stage },
          requestId,
        })) as { review?: unknown; model?: unknown };
        init.signal?.throwIfAborted();
        const review = parseReview(output.review);
        if (!review || typeof output.model !== "string")
          return reply({ error: "Local model returned invalid coaching. No score recorded." }, 502);
        return reply({ review, model: output.model });
      } finally {
        init.signal?.removeEventListener("abort", cancel);
      }
    } catch (error) {
      return reply(
        {
          error:
            typeof error === "string"
              ? error
              : error instanceof Error
                ? error.message
                : "Local review unavailable.",
        },
        503,
      );
    }
  };
}
export function installLocalCoach() {
  configureCoachTransport(createDesktopCoach(invoke));
}
export const localStatus = () => invoke<LocalStatus>("ollama_status");
export const downloadModel = (model: string) => invoke<void>("start_model_download", { model });
export const cancelOperation = (operationId: string) =>
  invoke<void>("cancel_local_operation", { operationId });
