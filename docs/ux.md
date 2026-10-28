# UX

How Stepwise looks, moves and responds. [Requirements](requirements.md) hold the testable checks; this document holds the design they check.

## Screens

| Screen | Job | Primary action |
|---|---|---|
| Library | Choose what to practice | Open a problem |
| Workspace: write | Write and test a solution | Walk through |
| Workspace: walk | Understand what the code did | Step |
| Settings (sheet) | Theme, default speed, motion, font size, keys | — |

Write and walk are two modes of one screen, not two pages. The layout stays put when switching; only the right panel and the bottom dock change, so the learner's sense of where things are holds.

## First visit

1. The landing page shows a binary search walkthrough resting on its last step, with a Play button beside it. It moves only when pressed. One main button: **Try a problem**.
2. That opens a warm-up problem with a working solution prefilled and the Walk through button pulsing once. Python has been loading in the background since landing.
3. After the first walk, one tip: "Use ← and → to step. Now try writing your own." The starter code is then restored.

No signup wall, no tour carousel, no modal on arrival.

## Workspace layout

Desktop, 1200 px and wider:

```text
┌──────────────────────────────────────────────────────────────┐
│ ←  Island count          Grid · BFS     Medium     ⚙        │  48 px top bar
├───────────────────────────────┬──────────────────────────────┤
│                               │                              │
│  Editor (CodeMirror)          │  Write mode: test cases      │
│  current line highlighted     │  Walk mode:  views           │
│  in walk mode                 │   ┌ grid ┐  ┌ queue ┐        │
│                               │   └──────┘  └───────┘        │
│                               │  variables · call stack      │
├───────────────────────────────┴──────────────────────────────┤
│  "Neighbor (1,1) is land. Add it to the queue."              │  narration
│  ⏮  ◀  ▶  ▶▶   ━━━━━━━━●━━━━━━━━━━━━━━━  42 / 118   1×      │  56 px dock
└──────────────────────────────────────────────────────────────┘
```

- The split between editor and right panel is resizable, 50/50 by default, and remembered.
- Write mode dock: **Run tests** (secondary) and **Walk through** (primary, the only accent-filled button on screen).
- Walk mode dock: step controls. **Edit** returns to write mode at the same scroll position.
- Timeline markers: red for exceptions and failed assertions, small ticks for function calls.

**Tablet** (768–1199 px): views on top, editor below, both visible. Dock fixed to the bottom.

**Phone** (under 768 px): walk mode first. Views fill the screen, code collapses to the current line plus two lines of context, and swiping left or right steps. Editing works, with a one-time note that a keyboard is better.

## States

| State | What the learner sees |
|---|---|
| Runtime loading (first visit) | The editor works at once. Walk through shows "Getting Python ready" with a thin progress bar. Later visits load from cache. |
| Empty editor | Walk through stays enabled; pressing it shows "Write a solution first." beside the button. |
| Syntax error | Red underline at the error and a one-line message in the dock. In live mode, the last good walk stays, dimmed. |
| Exception at runtime | The walk opens at the failing step, marked red on the timeline. The sentence explains it: "grid[4] doesn't exist. The grid has 4 rows, numbered 0 to 3." |
| Step cap reached | The partial walk is available, and a banner names the loop that kept running. |
| Wrong answer | Expected and actual side by side, with **Walk through this case**. |
| All tests pass | A quiet success state, the understanding prompt (1–5) and a link to the next problem in the pattern. |
| Offline | Everything except sign-in sync works after the first visit. |

## Keyboard

| Key | Action |
|---|---|
| ⌘/Ctrl + Enter | Run tests |
| ⌘/Ctrl + ' | Walk through |
| ← / → | Previous / next step |
| Shift + → | Step over the current call |
| Alt + → | Next time the current line runs |
| Home / End | First / last step |
| Space | Play or pause |
| [ / ] | Slower / faster |
| E | Back to write mode |
| P | Problem statement |
| ? | Show all shortcuts |

Arrow keys step only when focus is outside the editor, so they never fight with text editing.

## Visual language

The interface uses kbui's default theme. Views use their own `--kb-viz-*` tokens, added to kbui as part of this work ([G1](kbui.md#gaps-to-add-to-kbui)). Color never carries meaning alone.

| Meaning | Token | Hue | Second signal |
|---|---|---|---|
| Current element or cursor | `--kb-viz-current` | Blue | 2 px outline, slight scale, pointer label |
| Visited or done | `--kb-viz-visited` | Teal | Filled background |
| Changed this step | `--kb-viz-changed` | Amber pulse | Brief underline on the value |
| Error | `--kb-viz-error` (aliases danger) | Red | Icon and text |
| Out of range or discarded | `--kb-viz-discarded` | Gray at 35% | Diagonal hatch |
| Answer path | `--kb-viz-path` (aliases accent) | Rust | Thicker stroke |

- "Current" deliberately avoids kbui's rust accent: rust and danger red sit close in hue, and the cursor must never read as an error.
- Type uses kbui's sans and monospace tokens. Values in views use tabular numerals so columns don't jitter.
- No decorative color in the views. Both themes and forced-colors mode are checked for contrast.

## Microcopy

- Narration uses the learner's own variable names: "lo moves to 4", not "the left pointer moves".
- Present tense, active voice, one sentence, under 90 characters.
- Errors say what happened and what to try. No apologies, and no raw tracebacks unless the learner expands them.

## Motion

Motion has one job: show what changed between two steps. Each step's changes play as one short, reversible segment, so stepping back plays the same motion in reverse.

| Change | Animation | kbui token | Duration |
|---|---|---|---|
| Pointer moves along an array | Slide the label and outline | `motion-duration-slow` | 240 ms |
| Value changes in place | Crossfade the digit, amber pulse behind it | `motion-duration-fast` + `viz-pulse-duration` (new) | 80 ms + 400 ms |
| Insert into list or queue | Neighbors slide, new item fades in from 90% scale | `motion-duration-slow` | 240 ms |
| Remove | Fade and shrink to 90%, neighbors close the gap | `motion-duration-base` | 160 ms |
| Linked-list arrow re-targets | Arrow path morphs to its new end | `motion-duration-slow` | 240 ms |
| Tree or graph changes shape | Untouched nodes stay fixed; only affected nodes move | `motion-duration-layout` (new) | about 320 ms |
| Cell visited | Fill sweeps in | `motion-duration-base` | 160 ms |
| Drawers, sheets, dialogs | kbui's own transitions | kbui component tokens | as shipped |

- **One source of timing.** The animation layer reads kbui's motion tokens from CSS at startup, so a token change retimes both the interface and the views.
- **Easing.** The standard easing token for state changes; enter and exit easings for items appearing and leaving. No bounce or overshoot.
- **Speed.** Playback rate scales every duration. At 2× and above, or while scrubbing, steps snap with no tween.
- **Rapid input.** Pressing → before a tween ends jumps it to its end and starts the next. Input never queues behind animation.
- **Reduced motion.** With `prefers-reduced-motion` or the in-app switch, nothing moves. Changes snap and keep a 2 px outline for 600 ms instead.
- **Stillness.** The editor never animates layout, and nothing moves while the learner types.

## Accessibility

- Target WCAG 2.2 AA, checked with axe in CI and a manual VoiceOver and NVDA pass each release.
- Every action works from the keyboard, with a visible focus ring. Touch targets are at least 44 px on phones and 24 px elsewhere.
- Narration goes to a polite live region, so screen-reader users hear each step.
- Every view has **Show as table**: the same state as an accessible HTML table, with pointer positions as columns.
- No meaning by color alone. The palette is checked with protanopia, deuteranopia and tritanopia simulation.
- Text scales to 200% without losing content; views reflow or scroll inside their own panel.
- Respects `prefers-reduced-motion`, `prefers-contrast` and `prefers-color-scheme`, each also settable in the app.
