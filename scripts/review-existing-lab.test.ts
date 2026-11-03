import { expect, it } from "vitest";
import { foundationReview } from "./review-existing-lab";

const context = {
  branch: "khallil/react-interview-lab",
  origin: "https://github.com/KhallilB/stepwise.git",
  foundationMerged: false,
  fixHeadPresent: true,
  dirty: false,
  changedFiles: ["scripts/review-existing-lab.ts"],
};

it("admits only the fixed, unmerged React lab foundation", () => {
  expect(foundationReview(context)).toEqual({ sizeLimit: 13000, fileLimit: 60 });
});

it.each([
  { branch: "khallil/another-feature" },
  { origin: "https://github.com/another/stepwise.git" },
  { origin: "https://github.com.example/KhallilB/stepwise.git" },
  { foundationMerged: true },
  { fixHeadPresent: false },
  { dirty: true },
  { changedFiles: ["app/react-lab/Workspace.tsx"] },
])("refuses a scope outside the owner-approved foundation: %j", (outside) => {
  expect(() => foundationReview({ ...context, ...outside })).toThrow();
});

it("accepts the same repository over SSH", () => {
  expect(foundationReview({ ...context, origin: "git@github.com:KhallilB/stepwise.git" })).toEqual({
    sizeLimit: 13000,
    fileLimit: 60,
  });
});
