import type { Check } from "./types.ts";

type CheckResult = { name: string; passed: boolean; detail: string };
export type PlaywrightRequest = { challengeId: string; code: string; stage: number; runId: string };
export type VerificationResult = { results: CheckResult[] } | { error: string };
function record(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
export function readPlaywrightRequest(value: unknown): PlaywrightRequest | null {
  if (
    !record(value) ||
    typeof value.challengeId !== "string" ||
    !/^[a-z0-9-]{1,80}$/.test(value.challengeId) ||
    typeof value.code !== "string" ||
    value.code.length > 30000 ||
    !Number.isInteger(value.stage) ||
    Number(value.stage) < 0 ||
    Number(value.stage) > 10 ||
    typeof value.runId !== "string" ||
    !/^[\w-]{1,80}$/.test(value.runId)
  )
    return null;
  return {
    challengeId: value.challengeId,
    code: value.code,
    stage: Number(value.stage),
    runId: value.runId,
  };
}
export function readPlaywrightResponse(
  value: unknown,
  request: PlaywrightRequest,
  checks: Check[],
): VerificationResult | null {
  if (
    !record(value) ||
    value.engine !== "playwright" ||
    value.browser !== "chromium" ||
    value.runId !== request.runId ||
    value.stage !== request.stage
  )
    return null;
  if (typeof value.error === "string" && value.error.length > 0 && value.error.length <= 1000)
    return { error: value.error };
  if (!Array.isArray(value.results) || value.results.length !== checks.length) return null;
  const results: CheckResult[] = [];
  for (const [index, item] of value.results.entries()) {
    if (
      !record(item) ||
      item.name !== checks[index]?.name ||
      typeof item.name !== "string" ||
      typeof item.passed !== "boolean" ||
      typeof item.detail !== "string" ||
      item.detail.length > 1000
    )
      return null;
    results.push({ name: item.name, passed: item.passed, detail: item.detail });
  }
  return { results };
}
