import { expect, it } from "vitest";
import { previewDocument, readResults } from "./sandbox";

it("isolates execution and escapes code that contains closing script tags", () => {
  const html = previewDocument(
    "window.startReactLab = () => {};",
    "</script><script>alert(1)</script>",
    [],
    "one",
  );
  expect(html.match(/<script>/g)).toHaveLength(1);
  expect(html).toContain("connect-src 'none'");
  expect(html).toContain("form-action 'none'");
  expect(html).not.toContain("</script><script>alert");
});

it("carries the trusted parent nonce into the isolated runtime without injecting HTML", () => {
  const html = previewDocument("window.startReactLab = () => {};", "", [], "one", "parent-42");
  expect(html).toContain('<script nonce="parent-42">');
  const unsafe = previewDocument(
    "window.startReactLab = () => {};",
    "",
    [],
    "one",
    '"><script>alert(1)</script>',
  );
  expect(unsafe).not.toContain("alert(1)");
  expect(unsafe.match(/<script/g)).toHaveLength(1);
});

it("rejects stale, malformed and partial test results", () => {
  const checks = [{ name: "Counts correctly", script: "" }];
  const base = {
    channel: "stepwise-react-lab",
    runId: "current",
    type: "results",
    results: [{ name: "Counts correctly", passed: true, detail: "Matched" }],
  };
  expect(readResults(base, "current", checks)).toEqual(base.results);
  expect(readResults(base, "old", checks)).toBeNull();
  expect(readResults({ ...base, results: [] }, "current", checks)).toBeNull();
  expect(
    readResults(
      { ...base, results: [{ name: "Counts correctly", passed: "true" }] },
      "current",
      checks,
    ),
  ).toBeNull();
  expect(
    readResults(
      { ...base, results: [{ name: "Wrong check", passed: true, detail: "Matched" }] },
      "current",
      checks,
    ),
  ).toBeNull();
});
