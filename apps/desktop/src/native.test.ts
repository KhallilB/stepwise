import { expect, it } from "vitest";
import { createDesktopCoach } from "./native";

it("adapts local status and rejects speech without cloud fallback", async () => {
  const calls: string[] = [];
  const transport = createDesktopCoach(async (command) => {
    calls.push(command);
    return { phase: "ready", model: "qwen2.5-coder:7b" };
  });
  const status = await (await transport("/api/react-lab/status")).json();
  expect(status.review).toEqual({ ready: true, provider: "ollama", model: "qwen2.5-coder:7b" });
  expect(status.speech.ready).toBe(false);
  expect((await transport("/api/react-lab/transcribe", { method: "POST" })).status).toBe(503);
  expect(calls).toEqual(["ollama_status"]);
});
it("passes only submission fields and validates model output before display", async () => {
  let payload: Record<string, unknown> | undefined;
  const transport = createDesktopCoach(async (_command, args) => {
    payload = args;
    return { model: "qwen2.5-coder:7b", review: { summary: "invalid" } };
  });
  const response = await transport("/api/react-lab/review", {
    method: "POST",
    body: JSON.stringify({
      challengeId: "snapshot",
      code: "code",
      explanation: "reasoning",
      stage: 0,
      resetToken: "not-native-input",
      endpoint: "https://evil",
    }),
  });
  expect(payload?.submission).toEqual({
    challengeId: "snapshot",
    code: "code",
    explanation: "reasoning",
    stage: 0,
  });
  expect(response.status).toBe(502);
});
