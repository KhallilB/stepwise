import { type HeapObj, num, ref } from "../trace/trace";
import { handTrace, type Row } from "./hand-trace";
import type { Problem } from "./problem";

// Planted bug: the branches are swapped, so a sum that is too small moves `hi` down, not `lo` up.
const source = `function pairSum(nums, target) {
  let lo = 0;
  let hi = nums.length - 1;
  while (lo < hi) {
    const sum = nums[lo] + nums[hi];
    if (sum === target) return [lo, hi];
    if (sum < target) hi--;
    else lo++;
  }
  return [];
}`;

export const nums = [1, 3, 4, 6, 9];
export const target = 12;

const heap: Record<string, HeapObj> = {
  h1: { kind: "array", items: nums.map(num), len: nums.length },
};

const rows: Row[] = [
  [1, [], {}, "pairSum starts, looking for two numbers in nums that add up to 12."],
  [2, ["assign"], { lo: 0 }, "lo starts at 0, on the smallest number."],
  [3, ["assign"], { lo: 0, hi: 4 }, "hi starts at 4, on the largest number."],
  [4, ["compare", "branch"], { lo: 0, hi: 4 }, "0 < 4, so the loop runs."],
  [5, ["index", "assign"], { lo: 0, hi: 4, sum: 10 }, "nums[0] + nums[4] is 1 + 9, so sum is 10."],
  [6, ["compare"], { lo: 0, hi: 4, sum: 10 }, "10 is not 12."],
  [
    7,
    ["compare", "assign"],
    { lo: 0, hi: 3, sum: 10 },
    "10 is too small, yet hi moves down to 3, which only makes the sum smaller.",
  ],
  [4, ["compare", "branch"], { lo: 0, hi: 3 }, "0 < 3, so the loop runs again."],
  [5, ["index", "assign"], { lo: 0, hi: 3, sum: 7 }, "1 + 6, so sum is 7."],
  [6, ["compare"], { lo: 0, hi: 3, sum: 7 }, "7 is not 12."],
  [7, ["compare", "assign"], { lo: 0, hi: 2, sum: 7 }, "7 is less than 12, so hi moves down to 2."],
  [4, ["compare", "branch"], { lo: 0, hi: 2 }, "0 < 2, so the loop runs again."],
  [5, ["index", "assign"], { lo: 0, hi: 2, sum: 5 }, "1 + 4, so sum is 5."],
  [6, ["compare"], { lo: 0, hi: 2, sum: 5 }, "5 is not 12."],
  [7, ["compare", "assign"], { lo: 0, hi: 1, sum: 5 }, "5 is less than 12, so hi moves down to 1."],
  [4, ["compare", "branch"], { lo: 0, hi: 1 }, "0 < 1, so the loop runs again."],
  [5, ["index", "assign"], { lo: 0, hi: 1, sum: 4 }, "1 + 3, so sum is 4."],
  [6, ["compare"], { lo: 0, hi: 1, sum: 4 }, "4 is not 12."],
  [7, ["compare", "assign"], { lo: 0, hi: 0, sum: 4 }, "4 is less than 12, so hi moves down to 0."],
  [4, ["compare", "branch"], { lo: 0, hi: 0 }, "0 < 0 is false, so the loop ends."],
  [10, [], { lo: 0, hi: 0 }, "pairSum returns [], but nums[1] + nums[4] is 3 + 9 = 12."],
];

const { steps, narration } = handTrace(
  "pairSum",
  heap,
  { nums: ref("h1"), target: num(target) },
  rows,
);

export const sortedPairSum: Problem = {
  slug: "sorted-pair-sum",
  title: "Sorted pair sum",
  pattern: "Two pointers",
  difficulty: "Medium",
  trace: { language: "javascript", source, steps },
  viewSpec: {
    confidence: 1,
    badge: "Array + two pointers",
    views: [{ type: "array", bind: "nums", pointers: ["lo", "hi"] }],
  },
  narration,
  bugStep: 6,
  expected: [1, 4],
};
