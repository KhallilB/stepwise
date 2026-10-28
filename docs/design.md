# Design

## Principles

- **One primary action per screen.** Library: choose. Workspace: walk through. Walk mode: step.
- **Everything shows the same moment.** The highlighted line, the picture, the variables and the sentence always describe one step.
- **Only what changed moves.** Everything else stays still.
- **Never go blank.** Broken code keeps the last working picture on screen, dimmed.
- **Draw it as it is taught.** Pointers are labeled arrows, grids are grids, trees are trees.
- **The learner can override.** Any automatic choice can be changed in one click and stays changed.

## Screens

| Screen | Purpose |
|---|---|
| Library | Choose a problem, filtered by pattern and difficulty |
| Workspace, write mode | Write code and run tests |
| Workspace, walk mode | Step through the run |
| Settings | Theme, speed, motion, font size, shortcuts |

Write and walk mode share one layout. Switching mode changes only the right panel and the bottom bar.

```text
┌──────────────────────────────────────────────────────────────┐
│ ←  Island count          Grid · BFS     Medium     ⚙        │
├───────────────────────────────┬──────────────────────────────┤
│  Editor                       │  Write: test cases           │
│  current line highlighted     │  Walk:  views, variables     │
├───────────────────────────────┴──────────────────────────────┤
│  "Neighbor (1,1) is land. Add it to the queue."              │
│  ⏮  ◀  ▶  ▶▶   ━━━━━━━━●━━━━━━━━━━━━━━━  42 / 118   1×      │
└──────────────────────────────────────────────────────────────┘
```

On tablets the views sit above the editor. On phones the views fill the screen, the code shrinks to the current line, and swiping steps.

### First visit

The landing page shows a finished binary search walkthrough with a Play button and one call to action, **Try a problem**. That opens a warm-up problem with a working solution, so the first walkthrough takes one click. There is no signup, tour or modal.

### Key states

| Situation | Response |
|---|---|
| Python still loading | The editor works immediately; Walk through shows a progress bar |
| Syntax error | Underline at the error and a one-line message |
| Runtime error | The walkthrough opens at the failing step with an explanation, e.g. "grid[4] doesn't exist. The grid has rows 0 to 3." |
| Wrong answer | Expected and actual side by side, with an option to walk through that case |
| Infinite loop | The run stops and names the loop that kept running |
| All tests pass | A short success state and a link to the next problem |

## Views

Stepwise inspects the data and the code to choose how to draw each variable. A badge names the choice, such as "Grid + BFS", and the learner can switch it.

| View | Used for | Release |
|---|---|---|
| Array with pointers | Lists and the index variables that move along them | First |
| Grid | Lists of equal-length lists | First |
| Linked list | Objects linked by `next` | First |
| Binary tree | Objects with `left` and `right` | First |
| Hash map or set | `dict` and `set` | First |
| Recursion tree | Functions that call themselves | First |
| General | Anything not recognized | First |
| Graph, DP table, heap, stack, queue, string | Their respective patterns | v1 |

## Visual language

The interface uses kbui's default theme. Views use a separate set of colors, and every color is paired with a second signal so meaning never depends on color alone.

| Meaning | Color | Second signal |
|---|---|---|
| Current element | Blue | Outline and label |
| Visited | Teal | Filled background |
| Changed this step | Amber | Brief underline |
| Error | Red | Icon and text |
| Out of range | Gray | Diagonal hatch |
| Answer path | Rust | Thicker line |

Narration uses the learner's variable names ("lo moves to 4"), stays under 90 characters, and never shows a raw traceback unless asked.

## Motion

Motion shows what changed between two steps and nothing else.

- Changes animate in 80–320 ms and reverse when stepping back.
- At 2× speed and above, or while scrubbing, changes snap without animation.
- A new keypress finishes the current animation immediately. Input never waits.
- With reduced motion enabled, nothing animates; changed items are outlined briefly instead.
- Nothing moves while the learner is typing.

## Keyboard

| Key | Action |
|---|---|
| ⌘/Ctrl + Enter | Run tests |
| ⌘/Ctrl + ' | Walk through |
| ← / → | Previous / next step |
| Shift + → | Step over a function call |
| Home / End | First / last step |
| Space | Play or pause |
| [ / ] | Slower / faster |
| E | Return to write mode |
| P | Problem statement |
| ? | All shortcuts |

Arrow keys step only when focus is outside the editor.

## Accessibility

- WCAG 2.2 AA, checked automatically in CI and manually with VoiceOver and NVDA each release.
- Every action is available from the keyboard with a visible focus ring.
- Each step's sentence is announced to screen readers.
- Every view can be shown as an accessible table.
- Text scales to 200% without loss of content.
- Reduced motion, high contrast and dark mode follow system settings and can be set in the app.
