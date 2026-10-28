# Building on kbui

Stepwise's interface is built with [kbui](https://github.com/KhallilB/kbui), a React 19 component library on Base UI with design tokens and plain CSS. This document lists what kbui already covers, what has to be added to it, and what stays in Stepwise. [Decision 0002](decisions/0002-build-on-kbui.md) records why.

**The rule.** Every component a Stepwise screen needs and kbui lacks is added to kbui, not copied into Stepwise. Parts that only make sense in Stepwise, such as the views, stay here.

## Already covered

| Stepwise need | kbui component | Notes |
|---|---|---|
| Walk through, Run tests, Edit | Button | One primary per screen; icon buttons require an `aria-label` |
| Step controls dock | Toolbar | Roving focus with arrow keys; see the keyboard rule below |
| Workspace panes, collapsible side panel | Panel, Panel.Group | Resizing is a gap (G2) |
| Pattern and difficulty tags | Badge | |
| Test pass or fail, runtime ready | Status | |
| Step-cap, syntax and exception banners | Callout | Info, warning and danger tones |
| Run summary ("3 of 4 passed, 118 steps") | Stat | |
| Library search | Input, search type with clear | |
| Pattern, difficulty and language filters | Select, Menu | |
| Speed, write or walk mode | RadioGroup (segmented) | |
| Live mode, reduced motion, theme | Switch | |
| "Getting Python ready" | Progress | |
| Shortcut hints | Tooltip | Needs Kbd inside (G5) |
| Settings, keyboard map | Dialog | |
| Statement, variables, call stack | ScrollArea | |
| Custom test input values | NumberField | |
| Library cards, page layout | Card, Grid | |

## Gaps to add to kbui

Each addition meets kbui's own contract: anatomy line, story, test, screenshot, accessibility scan. Size is rough effort: S about a day, M two to three days, L four to six.

| ID | Addition | Stepwise use | Size | Needed by |
|---|---|---|---|---|
| G1 | Visualization tokens: current, visited, changed, error, discarded, frontier, path; each with a foreground pair, a dark value and a forced-colors fallback | Every view | S | Phase 1 |
| G2 | Resizable Panel.Group with a window-splitter handle (separator role, arrow keys, Home and End, Enter to collapse) | Editor and view split | L | Phase 1 |
| G3 | Slider with toned marks and value text ("Step 42 of 118"), Page Up and Page Down | Timeline scrubber | M | Phase 1 |
| G4 | Tabs | Test cases; statement and hints | M | Phase 1 |
| G5 | Kbd | Shortcuts in tooltips and the keyboard map | S | Phase 1 |
| G6 | Announcer: live-region hook, polite and assertive | Narration, run results | S | Phase 1 |
| G7 | Code tokens (syntax colors, active line, line numbers, selection, error underline) and a CodeMirror 6 theme built from them | Editor | M | Phase 1 |
| G8 | Drawer | Problem statement; settings on phones | M | MVP |
| G9 | Table | Library, expected and actual values, "Show as table" | L | MVP |
| G10 | Toast | "Solved", "Draft restored", runner failures | M | MVP |
| G11 | Popover | View switcher ("Grid?"), why a view was chosen | M | MVP |
| G12 | Collapsible | Traceback details, constraints | S | MVP |
| G13 | Skeleton | Library and workspace loading | S | MVP |
| G14 | EmptyState | No search results, no attempts yet | S | MVP |
| G15 | Shortcut hook: scoped shortcuts that skip editable targets, with a registry for the keyboard map | All keyboard control | M | MVP |
| G20 | Layout intents Split and SupportingPane, with collapse rules for desktop, tablet and phone | Workspace at every size | L | MVP |
| G16 | Command palette on Combobox | ⌘K to jump to a problem | M | v1 |
| G17 | CodeBlock: read-only highlighted code with a line highlight | Phone walk mode, shared walks | M | v1 |
| G18 | Avatar and account menu | Sign-in | S | v1 |
| G19 | Sparkline or Meter | Complexity strip | M | v1 |

## Changes across kbui

- **Color separation.** kbui's rust accent and danger red are close in hue, and so are info teal and success green. The viz tokens stay apart: blue for current, teal for visited, amber for changed, danger plus an icon for error. They are checked with color-vision simulation and 3:1 non-text contrast in both themes.
- **Motion tokens.** Add a layout duration (about 320 ms) for tree and graph relayout, and a viz pulse duration (400 ms). Everything else maps to the existing fast, base and slow durations.
- **Forced colors.** The viz tokens need system-color fallbacks (Highlight for current, Mark for changed, GrayText for discarded) and patterns in place of fills.
- **Touch targets.** The dock uses small controls on desktop. At phone width they need at least 44 px.
- **Keyboard rule.** Toolbar uses arrow keys to move focus. Global ← and → stepping applies only when focus is on the page, a view or the timeline. The shortcut hook (G15) enforces this.
- **Isolation headers.** Stepwise serves COOP and COEP for Pyodide. CI confirms every page renders under `require-corp`.

## Stays in Stepwise

The views, the playback engine and trace store, narration, the detector, the runner workers and the CodeMirror integration. Views draw plain SVG or canvas styled with `--kb-viz-*` tokens and never render a kbui component per cell or per step, which keeps each step under the 8 ms budget. A view moves into kbui only if a second product needs it.

## How the work flows

- During development Stepwise installs kbui by local path; CI installs a pinned release tarball. All kbui packages share one version.
- kbui releases are grouped by Stepwise phase: G1–G7 before Phase 1, G8–G15 and G20 before the MVP beta, later releases for v1 items.
- A temporary component inside Stepwise is allowed only with a ticket to move it into kbui within the same phase.
