import { describe, expect, it } from "vitest";
import { findProblem, problems } from "./catalog";

describe("problem catalog", () => {
  it("lists binary search and sorted pair sum, with unique slugs", () => {
    expect(problems.map((p) => p.slug)).toEqual(["binary-search", "sorted-pair-sum"]);
  });

  it("gives every problem a pattern and a difficulty for the picker", () => {
    for (const p of problems) {
      expect(p.pattern).toBeTruthy();
      expect(["Easy", "Medium", "Hard"]).toContain(p.difficulty);
    }
  });

  it("finds a problem by slug", () => {
    expect(findProblem("sorted-pair-sum")?.title).toBe("Sorted pair sum");
    expect(findProblem("nope")).toBeUndefined();
  });
});
