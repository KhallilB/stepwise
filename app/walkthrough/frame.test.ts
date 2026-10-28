import { describe, expect, it } from "vitest";
import { binarySearch } from "../problems/binary-search";
import { clampStep, frameAt } from "./frame";

describe("frameAt", () => {
  it("takes line, picture and sentence from the same step", () => {
    const frame = frameAt(binarySearch, binarySearch.bugStep);

    expect(frame.line).toBe(4);
    expect(frame.sentence).toBe("7 < 7 is false, so the loop ends before checking nums[7].");
    expect(frame.arrays).toEqual([
      {
        name: "nums",
        items: [1, 3, 5, 7, 9, 11, 13, 15],
        pointers: [
          { name: "lo", index: 7 },
          { name: "hi", index: 7 },
        ],
      },
    ]);
  });

  it("draws only pointers that are in scope", () => {
    expect(frameAt(binarySearch, 0).arrays[0]?.pointers).toEqual([]);
    expect(frameAt(binarySearch, 4).arrays[0]?.pointers).toEqual([
      { name: "lo", index: 0 },
      { name: "mid", index: 3 },
      { name: "hi", index: 7 },
    ]);
  });

  it("reports position in the walk", () => {
    const frame = frameAt(binarySearch, 2);
    expect(frame.index).toBe(2);
    expect(frame.total).toBe(17);
  });
});

describe("clampStep", () => {
  it("keeps the step inside the walk", () => {
    expect(clampStep(-1, 17)).toBe(0);
    expect(clampStep(17, 17)).toBe(16);
    expect(clampStep(5, 17)).toBe(5);
  });
});
