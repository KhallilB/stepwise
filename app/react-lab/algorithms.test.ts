import * as React from "react";
import ts from "typescript";
import { expect, it } from "vitest";
import { findChallenge } from "./curriculum";

function reference(id: string, name: string): (...args: unknown[]) => unknown {
  const challenge = findChallenge(id);
  expect(challenge, `Missing practical algorithm exercise ${id}`).toBeDefined();
  if (!challenge) throw new Error(`Missing exercise ${id}`);
  const exports: Record<string, unknown> = {};
  const compiled = ts.transpileModule(challenge.solution, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.React,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  // Evaluate authored references only; learner drafts stay inside preview.
  new Function("require", "exports", compiled)((module: string) => {
    if (module === "react") return React;
    throw new Error(`Unexpected reference dependency ${module}`);
  }, exports);
  expect(typeof exports[name], `${id} exports ${name}`).toBe("function");
  return exports[name] as (...args: unknown[]) => unknown;
}

it("projects product records without changing their identity or source", () => {
  const project = reference("product-projection", "projectProducts");
  const items = Object.freeze([
    Object.freeze({ id: "tea", name: "Tea", cents: 1250 }),
    Object.freeze({ id: "coffee", name: "Coffee", cents: 300 }),
  ]);
  expect(project(items)).toEqual([
    { id: "tea", label: "Tea — 12.50" },
    { id: "coffee", label: "Coffee — 3.00" },
  ]);
  expect(project([])).toEqual([]);
});

it("distinguishes matching records, any matches, and all-match semantics", () => {
  const stock = reference("stock-availability", "stockSummary");
  expect(
    stock([
      { id: "tea", stock: 2 },
      { id: "coffee", stock: 0 },
    ]),
  ).toEqual({ available: ["tea"], any: true, all: false });
  expect(stock([{ id: "tea", stock: 1 }])).toEqual({ available: ["tea"], any: true, all: true });
  expect(stock([])).toEqual({ available: [], any: false, all: true });
});

it("returns one matching product and an explicit missing result", () => {
  const lookup = reference("cart-lookup", "lookupProduct");
  const first = Object.freeze({ id: "tea", name: "Tea", cents: 100 }),
    second = Object.freeze({ id: "tea", name: "Later duplicate", cents: 200 });
  expect(lookup(Object.freeze([first, second]), "tea")).toBe(first);
  expect(lookup([first], "absent")).toBeNull();
  expect(lookup([], "tea")).toBeNull();
});

it("aggregates quantities and minor-unit amounts with an empty identity", () => {
  const summarize = reference("sales-summary", "summarizeSales");
  expect(
    summarize(
      Object.freeze([
        Object.freeze({ category: "Books", quantity: 2, cents: 1250 }),
        Object.freeze({ category: "Tools", quantity: 1, cents: 300 }),
        Object.freeze({ category: "Books", quantity: 1, cents: 500 }),
      ]),
    ),
  ).toEqual({ units: 4, cents: 3300, byCategory: { Books: 3, Tools: 1 } });
  expect(summarize([])).toEqual({ units: 0, cents: 0, byCategory: {} });
  expect(summarize([{ category: "__proto__", quantity: 1, cents: 200 }])).toEqual({
    units: 1,
    cents: 200,
    byCategory: { ["__proto__"]: 1 },
  });
});

it("merges overlapping pages by identity with latest payload and first-seen order", () => {
  const merge = reference("merge-feed-pages", "mergePages");
  const a = Object.freeze({ id: "a", name: "Old" }),
    b = Object.freeze({ id: "b", name: "B" }),
    updated = Object.freeze({ id: "a", name: "New" });
  expect(merge(Object.freeze([a, b]), Object.freeze([updated, { id: "c", name: "C" }]))).toEqual([
    updated,
    b,
    { id: "c", name: "C" },
  ]);
  expect(merge([], [])).toEqual([]);
  expect(merge([a], [updated, updated])).toEqual([updated]);
});

it("ranks numeric prices immutably with deterministic id ties", () => {
  const rank = reference("rank-products", "rankProducts");
  const records = Object.freeze([
    Object.freeze({ id: "z", cents: 1200 }),
    Object.freeze({ id: "b", cents: 300 }),
    Object.freeze({ id: "a", cents: 300 }),
  ]);
  expect(rank(records, false)).toEqual([
    { id: "a", cents: 300 },
    { id: "b", cents: 300 },
    { id: "z", cents: 1200 },
  ]);
  expect(rank(records, true)).toEqual([
    { id: "z", cents: 1200 },
    { id: "a", cents: 300 },
    { id: "b", cents: 300 },
  ]);
  expect(records.map((record) => record.id)).toEqual(["z", "b", "a"]);
});

it("counts each tag once per product while retaining independent products", () => {
  const tags = reference("tag-facets", "tagCounts");
  expect(tags([{ tags: ["react", "react", "css"] }, { tags: ["css"] }, { tags: [] }])).toEqual([
    { tag: "css", count: 2 },
    { tag: "react", count: 1 },
  ]);
  expect(tags([])).toEqual([]);
});

it("computes trailing windows with exact left-boundary and duplicate-time behavior", () => {
  const windows = reference("activity-window", "windowCounts");
  expect(windows([0, 2, 5, 5, 9], 5)).toEqual([1, 2, 2, 3, 3]);
  expect(windows([0, 2, 5, 5, 9], 3)).toEqual([1, 2, 1, 2, 1]);
  expect(windows([], 5)).toEqual([]);
});

it("processes a sorted event stream with a bounded number of timestamp reads", () => {
  const windows = reference("activity-window", "windowCounts");
  let reads = 0;
  const times = new Proxy(
    Array.from({ length: 5000 }, (_, i) => i),
    {
      get(target, key, receiver) {
        if (typeof key === "string" && /^\d+$/.test(key)) reads++;
        return Reflect.get(target, key, receiver);
      },
    },
  );
  expect(windows(times, 100)).toHaveLength(5000);
  expect(reads).toBeLessThanOrEqual(25000);
});

it("seeks the first timestamp at or after the playhead including duplicate boundaries", () => {
  const lowerBound = reference("timeline-seek", "lowerBound");
  for (const [target, index] of [
    [-1, 0],
    [0, 0],
    [5, 1],
    [6, 3],
    [10, 4],
  ])
    expect(lowerBound([0, 5, 5, 9], target)).toBe(index);
  expect(lowerBound([], 2)).toBe(0);
});

it("seeks large timelines using logarithmically bounded timestamp reads", () => {
  const seek = reference("timeline-seek", "lowerBound");
  let reads = 0;
  const times = new Proxy(
    Array.from({ length: 65536 }, (_, i) => i * 2),
    {
      get(target, key, receiver) {
        if (typeof key === "string" && /^\d+$/.test(key)) reads++;
        return Reflect.get(target, key, receiver);
      },
    },
  );
  expect(seek(times, 99999)).toBe(50000);
  expect(reads).toBeLessThanOrEqual(18);
});

it("walks expanded comment branches in depth-first order and keeps orphan roots", () => {
  const visible = reference("comment-tree", "visibleComments");
  const comments = Object.freeze(
    [
      { id: "a", parentId: null, title: "Intro" },
      { id: "b", parentId: "a", title: "Reply" },
      { id: "c", parentId: "b", title: "Detail" },
      { id: "d", parentId: "missing", title: "Orphan" },
    ].map(Object.freeze),
  );
  expect(visible(comments, new Set())).toEqual([
    { id: "a", title: "Intro", depth: 0 },
    { id: "d", title: "Orphan", depth: 0 },
  ]);
  expect(visible(comments, new Set(["a", "b"]))).toEqual([
    { id: "a", title: "Intro", depth: 0 },
    { id: "b", title: "Reply", depth: 1 },
    { id: "c", title: "Detail", depth: 2 },
    { id: "d", title: "Orphan", depth: 0 },
  ]);
  expect(visible([], new Set())).toEqual([]);
});

it("models prototype navigation with two stacks and abandons forward branches", () => {
  const navigate = reference("command-history", "navigate");
  const initial = Object.freeze({
    back: Object.freeze([]),
    current: "Home",
    forward: Object.freeze([]),
  });
  expect(navigate(initial, { type: "back" })).toEqual(initial);
  const guide = navigate(initial, { type: "visit", page: "Guide" });
  const api = navigate(guide, { type: "visit", page: "API" });
  const back = navigate(api, { type: "back" });
  expect(back).toEqual({ back: ["Home"], current: "Guide", forward: ["API"] });
  expect(navigate(back, { type: "forward" })).toEqual(api);
  expect(navigate(back, { type: "visit", page: "Examples" })).toEqual({
    back: ["Home", "Guide"],
    current: "Examples",
    forward: [],
  });
  expect(navigate(guide, { type: "visit", page: "Guide" })).toEqual(guide);
});

it("plans a dependency-respecting FIFO release order without mutating inputs", () => {
  const plan = reference("dependency-planner", "planRelease");
  const tasks = Object.freeze(
    [
      { id: "tokens", dependsOn: [] },
      { id: "button", dependsOn: ["tokens", "tokens"] },
      { id: "form", dependsOn: ["button"] },
      { id: "docs", dependsOn: ["tokens"] },
    ].map((task) => Object.freeze({ ...task, dependsOn: Object.freeze(task.dependsOn) })),
  );
  expect(plan(tasks)).toEqual({ order: ["tokens", "button", "docs", "form"], blocked: [] });
  expect(plan([])).toEqual({ order: [], blocked: [] });
});

it("reports unresolved cycle, descendant, and missing-dependency tasks without hiding independent work", () => {
  const plan = reference("dependency-planner", "planRelease");
  expect(
    plan([
      { id: "a", dependsOn: ["b"] },
      { id: "b", dependsOn: ["a"] },
      { id: "c", dependsOn: ["b"] },
      { id: "docs", dependsOn: [] },
    ]),
  ).toEqual({ order: ["docs"], blocked: ["a", "b", "c"] });
  expect(
    plan([
      { id: "deploy", dependsOn: ["unknown"] },
      { id: "notify", dependsOn: ["deploy"] },
      { id: "docs", dependsOn: [] },
    ]),
  ).toEqual({ order: ["docs"], blocked: ["deploy", "notify"] });
});
