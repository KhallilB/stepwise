# Visualization system

How a run of the learner's code becomes a picture. The system has three layers that talk only through two data formats:

```text
Runner  →  Trace  →  Detector  →  View spec  →  Renderer
```

Adding a language touches only the runner. Adding a view touches only the renderer. [Decision 0004](decisions/0004-trace-and-view-spec-contracts.md) records why.

## Trace

A language-neutral record of every step: the line, the call stack, the locals, and a heap of objects with stable ids, so two names for one list draw as one object.

- **Storage.** A full snapshot every 64 steps, with small deltas between them. Seeking to any step costs one snapshot plus at most 63 deltas.
- **Large values.** Lists over 1,000 items keep a window around the indexes the code touched, plus the length.
- **Events.** Each step is tagged with what happened (compare, assign, call, return, append, pop, branch), taken from the syntax node on that line. Narration and timeline markers read these tags.

```ts
type Trace = {
  language: "python" | "javascript" | "typescript" | string;
  source: string;
  steps: Step[]; // snapshot every 64 steps, deltas between
  truncated?: "steps" | "time" | "memory";
};

type Step = {
  i: number;
  line: number;
  event: "line" | "call" | "return" | "exception";
  tags: ("compare" | "assign" | "append" | "pop" | "branch" | "index")[];
  stack: Frame[]; // innermost last
  heap: Record<HeapId, HeapObj>;
  stdout?: string;
  exception?: { type: string; message: string };
};

type Frame = { fn: string; line: number; locals: Record<string, Value> };

type Value =
  | { kind: "prim"; type: "int" | "float" | "str" | "bool" | "none"; v: unknown }
  | { kind: "ref"; id: HeapId };

type HeapObj =
  | { kind: "list" | "tuple" | "set" | "deque"; items: Value[]; len: number; window?: [number, number] }
  | { kind: "dict"; entries: [Value, Value][] }
  | { kind: "object"; cls: string; fields: Record<string, Value> };
```

## Detection

Three signals vote on each variable's view:

1. **Runtime shape**, from the values. A list of equal-length lists is a grid; an object whose only self-typed field is `next` is a linked list.
2. **Code roles**, from tree-sitter queries over the source. In `grid[r][c]`, `r` and `c` are the cursor on `grid`; in `nums[lo]`, `lo` is a pointer on `nums`.
3. **Problem context**, from the problem's tags, such as `grid-bfs` or `two-pointer`. For pasted problems in v1, an LLM proposes the tags once and the result is cached.

```text
score = shape × 0.5 + roles × 0.3 + context × 0.2
```

A learner's pin overrides everything. Below a confidence of 0.6 the variable gets the generic view. A layout pass then picks up to three primary views; the rest stay in the variables panel.

**Ambiguity.** When two views score within 0.1 of each other (an n×n grid of 0s and 1s could be a maze or an adjacency matrix), the badge reads "Grid?" and one click shows the alternative. The choice is remembered.

## View catalog

| View | Shape signal | Code signal | Renderer | Release |
|---|---|---|---|---|
| Array + pointers | List of scalars | Integer variables used as its index | SVG; windowed around pointers past 200 items | MVP |
| Grid / matrix | List of equal-length lists | `x[r][c]`, direction arrays, a visited set of pairs | SVG up to 400 cells, PixiJS above | MVP |
| Linked list | Object with one self-typed field | `.next`, `prev` / `curr` names | SVG with morphing arrows | MVP |
| Binary tree | Object with two self-typed fields | `.left` / `.right` | d3-hierarchy tidy tree, SVG | MVP |
| Hash map / set | `dict`, `set` | `in`, `get`, counters | SVG key-value rows, recent key highlighted | MVP |
| Call stack + recursion tree | Self-calls deeper than 1 | Recursive call site | d3-hierarchy; frames collapse on return | MVP |
| Generic | Anything else | — | Boxes and arrows | MVP |
| Graph | Map of key to list of keys, edge list | `visited`, `queue`, `heappush` | ELK layered or d3-force; PixiJS past 300 nodes | v1 |
| DP table | Grid filled in order | `dp[i][j] = … dp[i-1][j] …` | SVG, arrows from cells read to the cell written | v1 |
| Heap | List that keeps the heap property | `heapq.*` | Tree from indexes, array beneath | v1 |
| Stack / queue | List changed only at one or both ends | `append` / `pop`, `popleft` | SVG chips | v1 |
| String | String indexed by integers | `s[i]`, window variables | Character array | v1 |

## View spec

The detector's output and the renderer's only input.

```ts
type ViewSpec = {
  confidence: number; // 0..1
  badge: string;      // "Grid + BFS"
  views: View[];      // at most 3 primary
};

type View =
  | { type: "array"; bind: string; pointers: string[]; window?: string[] }
  | { type: "grid"; bind: string; cursor?: [string, string]; overlays?: Overlay[] }
  | { type: "linkedList"; head: string; pointers: string[] }
  | { type: "tree"; root: string; pointers: string[] }
  | { type: "hashMap"; bind: string }
  | { type: "callTree"; fn: string }
  | { type: "graph"; bind: string; frontier?: string; visited?: string }
  | { type: "dpTable"; bind: string }
  | { type: "generic"; bind: string };

type Overlay = { set: string; style: "visited" | "frontier" | "path" };
```

Example, for a grid BFS that counts islands:

```json
{
  "confidence": 0.92,
  "badge": "Grid + BFS",
  "views": [
    { "type": "grid", "bind": "grid", "cursor": ["r", "c"],
      "overlays": [{ "set": "seen", "style": "visited" }] },
    { "type": "array", "bind": "q", "pointers": [] }
  ]
}
```

## MVP problem set

| Pattern | Count | Primary view |
|---|---|---|
| Arrays and hashing | 4 | Array, hash map |
| Two pointers | 3 | Array + pointers |
| Sliding window | 3 | Array + window |
| Binary search | 3 | Array + lo / mid / hi |
| Stack | 2 | Array as stack |
| Linked list | 4 | Linked list |
| Trees | 4 | Binary tree, call tree |
| Grid BFS / DFS | 4 | Grid |
| Recursion and backtracking | 3 | Call tree |
