import { expect, it } from "vitest";
import { findChallenge } from "../react-lab/curriculum";
import { parseProgress, sections } from "./plan";

it("offers the agreed five-hour plan with working exercise and HTTPS resource links", () => {
  expect(sections.map((s) => s.items.reduce((sum, item) => sum + item.minutes, 0))).toEqual([
    180, 75, 45,
  ]);
  const items = sections.flatMap((s) => s.items);
  expect(items).toHaveLength(16);
  expect(new Set(items.map((i) => i.id)).size).toBe(16);
  for (const item of items) {
    if (item.exercise) expect(findChallenge(item.exercise)).toBeDefined();
    for (const resource of item.resources) expect(new URL(resource.href).protocol).toBe("https:");
  }
});
it("restores only known checked items for this dated plan", () => {
  expect(
    parseProgress(JSON.stringify({ version: 1, completed: ["snapshot", "bogus", "snapshot"] })),
  ).toEqual({ version: 1, completed: ["snapshot"] });
});
it("rejects malformed, oversized and incompatible saved progress", () => {
  for (const value of [
    null,
    "{",
    "x".repeat(4097),
    '{"version":2,"completed":[]}',
    '{"version":1,"completed":[3]}',
    '{"version":1,"completed":null}',
  ])
    expect(parseProgress(value)).toBeNull();
});
