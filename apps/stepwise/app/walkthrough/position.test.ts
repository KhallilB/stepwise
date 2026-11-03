import { expect, it } from "vitest";
import { readPosition } from "./position";

it("restores only valid steps within current walkthrough", () => {
  expect(readPosition('{"version":1,"index":3}', 6)).toBe(3);
  for (const raw of [
    null,
    "bad json",
    '{"version":2,"index":3}',
    '{"version":1,"index":-1}',
    '{"version":1,"index":2.5}',
    '{"version":1,"index":6}',
  ])
    expect(readPosition(raw, 6)).toBe(0);
});
