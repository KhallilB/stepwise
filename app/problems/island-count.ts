import { type HeapObj, num, ref, type Value } from "../trace/trace";
import { handTrace, type Row } from "./hand-trace";
import type { Problem } from "./problem";

// Planted bug: `nr > rows` lets row `rows` through the bounds check, one past the last row.
const source = `function numIslands(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  const seen = grid.map((row) => row.map(() => false));
  let count = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== 1 || seen[r][c]) continue;
      count++;
      seen[r][c] = true;
      const q = [[r, c]];
      while (q.length > 0) {
        const [cr, cc] = q.shift();
        for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const [nr, nc] = [cr + dr, cc + dc];
          if (nr < 0 || nr > rows || nc < 0 || nc >= cols) continue;
          if (grid[nr][nc] !== 1 || seen[nr][nc]) continue;
          seen[nr][nc] = true;
          q.push([nr, nc]);
        }
      }
    }
  }
  return count;
}`;

export const grid = [
  [1, 0, 0],
  [1, 0, 1],
];

type Cell = [row: number, col: number];
/** What the search has changed by a step: cells marked seen, and q front to back. */
type State = { seen: Cell[]; q: Cell[] };

const bool = (v: boolean): Value => ({ kind: "prim", type: "boolean", v });
const cellId = ([r, c]: Cell) => `cell-${r}-${c}`;

function heapAt({ seen, q }: State): Record<string, HeapObj> {
  const heap: Record<string, HeapObj> = {
    grid: { kind: "array", items: grid.map((_, r) => ref(`grid${r}`)), len: grid.length },
    seen: { kind: "array", items: grid.map((_, r) => ref(`seen${r}`)), len: grid.length },
    q: { kind: "array", items: q.map((cell) => ref(cellId(cell))), len: q.length },
  };
  grid.forEach((row, r) => {
    heap[`grid${r}`] = { kind: "array", items: row.map(num), len: row.length };
    const marked = row.map((_, c) => bool(seen.some(([sr, sc]) => sr === r && sc === c)));
    heap[`seen${r}`] = { kind: "array", items: marked, len: row.length };
  });
  for (const cell of q) heap[cellId(cell)] = { kind: "array", items: cell.map(num), len: 2 };
  return heap;
}

const rows: Row[] = [];
const states: State[] = [];
let state: State = { seen: [], q: [] };
const step = (row: Row, change: Partial<State> = {}) => {
  state = { ...state, ...change };
  rows.push(row);
  states.push(state);
};

const top = { rows: 2, cols: 3, seen: ref("seen") };
const scan = { ...top, count: 0, r: 0, c: 0 };
const bfs = { ...top, count: 1, r: 0, c: 0, q: ref("q") };
const at00 = { ...bfs, cr: 0, cc: 0 };
const at10 = { ...bfs, cr: 1, cc: 0 };
const toward = (at: typeof at00, dr: number, dc: number) => ({
  ...at,
  dr,
  dc,
  nr: at.cr + dr,
  nc: at.cc + dc,
});
const below00 = toward(at00, 1, 0);
const above00 = toward(at00, -1, 0);
const right00 = toward(at00, 0, 1);
const left00 = toward(at00, 0, -1);
const below10 = toward(at10, 1, 0);
const loop = ["compare", "branch"] as const;
const check = ["index", "compare", "branch"] as const;

step([1, [], {}, "numIslands starts on a 2 by 3 grid of land (1) and water (0)."]);
step([2, ["assign"], { rows: 2 }, "rows is 2."]);
step([3, ["index", "assign"], { rows: 2, cols: 3 }, "cols is 3."]);
step([4, ["assign"], top, "seen starts as a 2 by 3 grid of false: no cell is seen yet."]);
step([5, ["assign"], { ...top, count: 0 }, "count starts at 0."]);
step([6, [...loop], { ...top, count: 0, r: 0 }, "r is 0, and 0 < 2, so the scan starts on row 0."]);
step([7, [...loop], scan, "c is 0, and 0 < 3, so the scan checks cell (0, 0)."]);
step([8, [...check], scan, "grid[0][0] is land and not seen yet, so a new island starts."]);
step([9, ["assign"], { ...scan, count: 1 }, "count goes up to 1."]);
step([10, ["assign"], { ...scan, count: 1 }, "seen[0][0] is now true."], { seen: [[0, 0]] });
step([11, ["assign"], bfs, "q starts with [0, 0], the first cell of this island."], {
  q: [[0, 0]],
});
step([12, [...loop], bfs, "q has 1 cell, so the search goes on."]);
step([13, ["pop", "assign"], at00, "[0, 0] leaves the front of q, so cr is 0 and cc is 0."], {
  q: [],
});
step([14, ["assign"], { ...at00, dr: 1, dc: 0 }, "First direction is down: dr is 1, dc is 0."]);
step([15, ["assign"], below00, "The neighbor below is (1, 0)."]);
step([16, [...loop], below00, "(1, 0) is inside the grid."]);
step([17, [...check], below00, "grid[1][0] is land and not seen yet."]);
step([18, ["assign"], below00, "seen[1][0] is now true."], {
  seen: [
    [0, 0],
    [1, 0],
  ],
});
step([19, ["append"], below00, "[1, 0] joins the back of q."], {
  q: [[1, 0]],
});
step([14, ["assign"], { ...at00, dr: -1, dc: 0 }, "Next direction is up: dr is -1, dc is 0."]);
step([15, ["assign"], above00, "The neighbor above is (-1, 0)."]);
step([16, [...loop], above00, "-1 < 0, so (-1, 0) is off the top edge. Skip it."]);
step([14, ["assign"], { ...at00, dr: 0, dc: 1 }, "Next direction is right: dr is 0, dc is 1."]);
step([15, ["assign"], right00, "The neighbor to the right is (0, 1)."]);
step([16, [...loop], right00, "(0, 1) is inside the grid."]);
step([17, [...check], right00, "grid[0][1] is water, so skip it."]);
step([14, ["assign"], { ...at00, dr: 0, dc: -1 }, "Last direction is left: dr is 0, dc is -1."]);
step([15, ["assign"], left00, "The neighbor to the left is (0, -1)."]);
step([16, [...loop], left00, "-1 < 0, so (0, -1) is off the left edge. Skip it."]);
step([12, [...loop], bfs, "q still has 1 cell, so the search goes on."]);
step([13, ["pop", "assign"], at10, "[1, 0] leaves the front of q, so cr is 1 and cc is 0."], {
  q: [],
});
step([14, ["assign"], { ...at10, dr: 1, dc: 0 }, "First direction is down: dr is 1, dc is 0."]);
step([15, ["assign"], below10, "The neighbor below is (2, 0), but grid only has rows 0 and 1."]);
step([16, [...loop], below10, "2 > 2 is false, so row 2 passes the bounds check."]);
step([
  17,
  ["index"],
  below10,
  "grid[2] doesn't exist. The grid has rows 0 to 1, so grid[2][0] throws.",
]);

const { steps, narration } = handTrace(
  "numIslands",
  (i) => heapAt(states[i] ?? state),
  { grid: ref("grid") },
  rows,
  { type: "TypeError", message: "Cannot read properties of undefined (reading '0')" },
);

export const islandCount: Problem = {
  slug: "island-count",
  title: "Island count",
  pattern: "Grid search",
  difficulty: "Medium",
  trace: { language: "javascript", source, steps },
  viewSpec: {
    confidence: 1,
    badge: "Grid + BFS",
    views: [
      {
        type: "grid",
        bind: "grid",
        cursors: [
          ["r", "c"],
          ["cr", "cc"],
          ["nr", "nc"],
        ],
        overlays: [{ set: "seen", style: "visited" }],
      },
      { type: "array", bind: "q", pointers: [] },
    ],
  },
  narration,
  bugStep: 33,
  expected: 2,
};
