import { describe, expect, it } from "vitest";
import { binarySearch } from "../problems/binary-search";
import { islandCount } from "../problems/island-count";
import { clampStep, frameAt } from "./frame";

const arrayAt = (step: number) => {
  const view = frameAt(binarySearch, step).views[0];
  if (view?.kind !== "array") throw new Error("expected an array view");
  return view;
};

describe("frameAt", () => {
  it("takes line, picture and sentence from the same step", () => {
    const frame = frameAt(binarySearch, binarySearch.bugStep);

    expect(frame.line).toBe(4);
    expect(frame.sentence).toBe("7 < 7 is false, so the loop ends before checking nums[7].");
    expect(frame.views).toEqual([
      {
        kind: "array",
        name: "nums",
        defined: true,
        items: [1, 3, 5, 7, 9, 11, 13, 15],
        pointers: [
          { name: "lo", index: 7 },
          { name: "hi", index: 7 },
        ],
      },
    ]);
  });

  it("draws only pointers that are in scope", () => {
    expect(arrayAt(0).pointers).toEqual([]);
    expect(arrayAt(4).pointers).toEqual([
      { name: "lo", index: 0 },
      { name: "mid", index: 3 },
      { name: "hi", index: 7 },
    ]);
  });

  it("draws the grid with seen cells and in-scope cursors, and the queue beside it", () => {
    const [grid, queue] = frameAt(islandCount, 12).views;
    expect(grid).toEqual({
      kind: "grid",
      name: "grid",
      defined: true,
      cells: [
        [1, 0, 0],
        [1, 0, 1],
      ],
      visited: [
        [true, false, false],
        [false, false, false],
      ],
      cursors: [
        { name: "r,c", row: 0, col: 0 },
        { name: "cr,cc", row: 0, col: 0 },
      ],
    });
    expect(queue).toEqual({ kind: "array", name: "q", defined: true, items: [], pointers: [] });
  });

  it("shows queued cells as [row, col] and keeps cursors that fall outside the grid", () => {
    const [grid, queue] = frameAt(islandCount, islandCount.bugStep).views;
    expect(grid?.kind === "grid" && grid.cursors).toContainEqual({ name: "nr,nc", row: 2, col: 0 });
    expect(frameAt(islandCount, 18).views[1]).toMatchObject({ items: ["[1, 0]"] });
    expect(queue).toMatchObject({ defined: true, items: [] });
  });

  it("marks a view not yet in scope", () => {
    expect(frameAt(islandCount, 0).views[1]).toMatchObject({ name: "q", defined: false });
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
