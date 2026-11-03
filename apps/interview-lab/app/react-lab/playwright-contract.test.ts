import { describe, expect, it } from "vitest";
import { readPlaywrightRequest, readPlaywrightResponse } from "./playwright-contract";
import { maxCodeLength } from "./progress";

const request = {
  challengeId: "snapshot",
  code: "export default function App(){return null}",
  stage: 0,
  runId: "run-1",
};
describe("local Playwright verification contract", () => {
  it("accepts bounded draft data and rejects paths, commands and invalid stage identities", () => {
    expect(readPlaywrightRequest(request)).toEqual(request);
    expect(readPlaywrightRequest({ ...request, code: "x".repeat(maxCodeLength) })).not.toBeNull();
    for (const input of [
      { ...request, challengeId: "../api" },
      { ...request, code: "x".repeat(maxCodeLength + 1) },
      { ...request, stage: -1 },
      { ...request, stage: 0.5 },
      { ...request, runId: "" },
      { ...request, code: null },
    ])
      expect(readPlaywrightRequest(input)).toBeNull();
  });
  it("only accepts matching run, stage and authored results", () => {
    const wire = {
      engine: "playwright",
      browser: "chromium",
      runId: "run-1",
      stage: 0,
      results: [{ name: "Reserve three", passed: false, detail: "Expected three seats" }],
    };
    const checks = [{ name: "Reserve three", script: "trusted" }];
    expect(readPlaywrightResponse(wire, request, checks)).toEqual({ results: wire.results });
    for (const changed of [
      { ...wire, runId: "old" },
      { ...wire, stage: 1 },
      { ...wire, browser: "unknown" },
      { ...wire, results: [] },
      { ...wire, results: [{ name: "Fake", passed: true, detail: "pass" }] },
    ])
      expect(readPlaywrightResponse(changed, request, checks)).toBeNull();
  });
});
