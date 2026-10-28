# Stepwise

**Write a solution. Watch it run, one step at a time.**

Stepwise is a practice space for data structures and algorithms. You pick a problem, write a solution and press **Walk through**. Your own code runs in the browser, every step is recorded, and Stepwise draws the data the way you would sketch it on a whiteboard: arrays with labeled pointers, grids, linked lists, trees, hash maps and recursion trees. Each step gets one plain-English sentence. When a test fails, Stepwise opens at the step where things went wrong.

```text
 1   3   5   7   9  11  13  15
                lo mid      hi
Step 6 of 6 · "nums[5] is 11. Found it."
```

Stepwise is in planning. This repository holds the product, UX and technical design; no application code exists yet. The roadmap opens with a two-week validation phase that can stop the project before anything is built.

## Why

Learners who think in pictures struggle with DSA because the material arrives as code and math notation, while understanding comes from seeing state change. Today the job is split between two kinds of tool:

- practice sites give you problems and a pass or fail verdict;
- visualizers show canned animations or generic box-and-arrow memory diagrams.

Stepwise joins the two: your code, your bug, drawn as the data structure it is.

## What the MVP does

| Capability | Notes |
|---|---|
| 30 original problems | Arrays, two pointers, sliding window, binary search, stacks, linked lists, trees, grid BFS/DFS, recursion |
| Python in the browser | Pyodide in a Web Worker; no account, no server cost per run, works offline |
| Walk mode | Step forward and back, play, scrub, change speed, all from the keyboard |
| Six automatic views | Array with pointers, grid, linked list, binary tree, hash map or set, call stack with recursion tree, plus a generic fallback |
| Narration | One sentence per step, using your variable names, read out by screen readers |
| Jump to failure | Opens at the exception or the wrong return |
| Live mode | Re-runs as you type; broken code keeps the last good picture on screen |

[Scope by release](docs/product.md#scope-by-release) lists what comes in v1 and v2.

## Stack

| Layer | Choice | Status |
|---|---|---|
| UI | React 19 and [kbui](https://github.com/KhallilB/kbui), from GitHub release tarballs | Planned |
| App | React Router 7 (framework mode) on Cloudflare Workers | Planned |
| Python runtime | Pyodide in a Web Worker, traced with `sys.settrace` | Planned |
| Parsing | web-tree-sitter, for variable roles | Planned |
| Editor | CodeMirror 6 | Planned |
| Views | SVG and PixiJS, animated with GSAP timelines timed by kbui motion tokens | Planned |
| Storage | IndexedDB (Dexie) on the device; Cloudflare D1 when signed in | Planned |

[Architecture](docs/architecture.md) explains how the pieces fit and why each was chosen.

## Documentation

| Document | Covers |
|---|---|
| [Product](docs/product.md) | The problem, who it is for, goals, metrics, principles, scope by release and the assumptions still to test |
| [Requirements](docs/requirements.md) | MVP functional requirements, each with the checks that close it |
| [UX](docs/ux.md) | Screens, layout, states, keyboard map, visual language, motion and accessibility |
| [Visualization system](docs/visualization.md) | Trace format, view detection, the view catalog and both schemas |
| [Architecture](docs/architecture.md) | Runtime layout, tech stack, performance budgets, safety, testing and analytics |
| [Building on kbui](docs/kbui.md) | What kbui already covers, the gaps to add to it, and what stays in Stepwise |
| [Roadmap](docs/roadmap.md) | Phases with exit criteria, risks and open questions |
| [Decision records](docs/decisions/README.md) | Why the larger choices were made |
| [Original spec](docs/specs/2026-10-27-stepwise-spec.html) | The 2026-10-27 product spec these documents were split from |

## License

[MIT](LICENSE)
