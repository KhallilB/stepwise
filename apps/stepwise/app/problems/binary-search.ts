import { type HeapObj, num, ref } from "../trace/trace";
import { handTrace, type Row } from "./hand-trace";
import type { Problem } from "./problem";

// Planted bug: `lo < hi` stops one step early, so the last candidate is never checked.
const source = `function search(nums, target) {
  let lo = 0;
  let hi = nums.length - 1;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}`;

export const nums = [1, 3, 5, 7, 9, 11, 13, 15];
export const target = 15;

const heap: Record<string, HeapObj> = {
  h1: { kind: "array", items: nums.map(num), len: nums.length },
};

const rows: Row[] = [
  [1, [], {}, "search starts, looking for 15 in nums."],
  [2, ["assign"], { lo: 0 }, "lo starts at 0."],
  [3, ["assign"], { lo: 0, hi: 7 }, "hi starts at 7, the last index."],
  [4, ["compare", "branch"], { lo: 0, hi: 7 }, "0 < 7, so the loop runs."],
  [5, ["assign"], { lo: 0, hi: 7, mid: 3 }, "mid is 3, halfway between lo and hi."],
  [6, ["compare", "index"], { lo: 0, hi: 7, mid: 3 }, "nums[3] is 7, not 15."],
  [7, ["compare", "assign"], { lo: 4, hi: 7, mid: 3 }, "7 is less than 15, so lo moves to 4."],
  [4, ["compare", "branch"], { lo: 4, hi: 7 }, "4 < 7, so the loop runs again."],
  [5, ["assign"], { lo: 4, hi: 7, mid: 5 }, "mid is 5."],
  [6, ["compare", "index"], { lo: 4, hi: 7, mid: 5 }, "nums[5] is 11, not 15."],
  [7, ["compare", "assign"], { lo: 6, hi: 7, mid: 5 }, "11 is less than 15, so lo moves to 6."],
  [4, ["compare", "branch"], { lo: 6, hi: 7 }, "6 < 7, so the loop runs again."],
  [5, ["assign"], { lo: 6, hi: 7, mid: 6 }, "mid is 6."],
  [6, ["compare", "index"], { lo: 6, hi: 7, mid: 6 }, "nums[6] is 13, not 15."],
  [7, ["compare", "assign"], { lo: 7, hi: 7, mid: 6 }, "13 is less than 15, so lo moves to 7."],
  [
    4,
    ["compare", "branch"],
    { lo: 7, hi: 7 },
    "7 < 7 is false, so the loop ends before checking nums[7].",
  ],
  [10, [], { lo: 7, hi: 7 }, "search returns -1, but 15 is at index 7."],
];

const { steps, narration } = handTrace(
  "search",
  heap,
  { nums: ref("h1"), target: num(target) },
  rows,
);

export const binarySearch: Problem = {
  slug: "binary-search",
  title: "Binary search",
  pattern: "Binary search",
  difficulty: "Easy",
  trace: { language: "javascript", source, steps },
  viewSpec: {
    confidence: 1,
    badge: "Array + pointers",
    views: [{ type: "array", bind: "nums", pointers: ["lo", "mid", "hi"] }],
  },
  narration,
  bugStep: 15,
  expected: 7,
};
