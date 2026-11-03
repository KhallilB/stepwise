import { expect, it } from "vitest";
import { challenges, tracks } from "./curriculum";

it("provides 76 runnable challenges spanning five difficulty levels and eight milestones", () => {
  expect(challenges).toHaveLength(76);
  expect(tracks).toHaveLength(8);
  expect(new Set(challenges.map((c) => c.id)).size).toBe(76);
  for (const level of ["Very easy", "Easy", "Medium", "Hard", "Very hard"])
    expect(challenges.filter((c) => c.level === level).length).toBeGreaterThanOrEqual(4);
  for (const track of tracks)
    expect(challenges.filter((c) => c.track === track.id).length).toBeGreaterThanOrEqual(3);
  for (const challenge of challenges) {
    expect(challenge.starter).toContain("export default");
    expect(challenge.solution).toContain("export default");
    expect(challenge.starter).not.toBe(challenge.solution);
    expect(challenge.checks.length).toBeGreaterThanOrEqual(2);
    expect(challenge.hints).toHaveLength(3);
    expect(challenge.rubric).toHaveLength(3);
    expect(challenge.followUp.length).toBeGreaterThan(25);
    expect(new URL(challenge.resource).hostname).toMatch(
      /^(react\.dev|www\.w3\.org|web\.dev|developer\.mozilla\.org|courses\.cis\.cornell\.edu)$/,
    );
    expect(tracks.some((track) => track.id === challenge.track)).toBe(true);
  }
});

it("starts with native web fundamentals and progresses without difficulty jumps backwards", () => {
  const levels = ["Very easy", "Easy", "Medium", "Hard", "Very hard"];
  expect(challenges[0]?.id).toBe("semantic-action");
  const ranks = challenges.map((challenge) => levels.indexOf(challenge.level));
  expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
  for (const id of ["cleanup", "stale", "reducer", "accessible", "memo"])
    expect(challenges.find((challenge) => challenge.id === id)?.level).toBe("Medium");
});

it("covers layout, content resilience, localization, semantics and component contracts", () => {
  for (const id of [
    "responsive-grid",
    "long-content",
    "locale-price",
    "fieldset-group",
    "component-callback",
    "dialog-focus",
    "tab-contract",
    "payload-validation",
    "abortable-search",
  ])
    expect(
      challenges.find((challenge) => challenge.id === id),
      id,
    ).toBeDefined();
  expect(challenges.filter((challenge) => challenge.level === "Very easy")).toHaveLength(9);
});

it("staged builds add constraints and preserve earlier checks within their timeboxes", () => {
  const builds = challenges.filter((challenge) => challenge.stages);
  expect(builds).toHaveLength(7);
  for (const build of builds) {
    expect(build.minutes).toBeGreaterThanOrEqual(30);
    expect(build.minutes).toBeLessThanOrEqual(40);
    expect(build.stages).toHaveLength(3);
    expect(build.stages?.reduce((minutes, stage) => minutes + stage.minutes, 0)).toBe(
      build.minutes,
    );
    expect(build.stages?.flatMap((stage) => stage.checks)).toEqual(build.checks);
  }
});
