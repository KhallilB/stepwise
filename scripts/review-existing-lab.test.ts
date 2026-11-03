import { expect, it } from "vitest";
import { foundationGateArguments, foundationReview } from "./review-existing-lab";

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

it("pins full review and current main while forwarding evidence commands", () => {
  expect(
    foundationGateArguments(["probes=16", "artifact=bun run test", "coupled=bun run build"]),
  ).toEqual([
    "gate",
    "tier=full",
    "base=origin/main",
    "probes=16",
    "artifact=bun run test",
    "coupled=bun run build",
  ]);
});

it.each([
  ["probes=16", "artifact=bun run test"],
  ["probes=0", "artifact=bun run test", "coupled=bun run build"],
  ["probes=16", "artifact=", "coupled=bun run build"],
  ["probes=16", "artifact=bun run test", "coupled=bun run build", "tier=light"],
  ["probes=16", "artifact=bun run test", "coupled=bun run build", "base=HEAD^"],
  ["probes=16", "artifact=bun run test", "coupled=bun run build", "--force"],
  ["probes=16", "probes=1", "artifact=bun run test", "coupled=bun run build"],
])("refuses incomplete or weakening gate arguments: %j", (...args) => {
  expect(() => foundationGateArguments(args)).toThrow();
});
