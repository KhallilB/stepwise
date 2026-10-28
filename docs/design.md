# Design

## What guides the design

Each screen has one main action: choose a problem in the library, walk through in the workspace, step in walk mode. If a feature needs a fourth screen, it waits.

Everything on screen describes the same moment. The highlighted line, the picture, the variables and the sentence never drift apart. Only what changed in a step moves, and the rest stays still.

We never leave the learner looking at a blank panel. If their code breaks mid-thought, the last working picture stays up, dimmed, with a small badge.

We draw data the way it's taught: pointers as labeled arrows, grids as grids, trees as trees. The generic box-and-arrow diagram is a fallback, not the default. And any choice Stepwise makes for the learner, whether a view, a speed or an input, can be changed in one click and stays changed.

## Screens

There are three: the **library**, where you choose a problem; the **workspace**, where you write and run code; and **walk mode**, where you step through a run. Settings open in a sheet.

Writing and walking happen on the same screen. Switching between them only changes the right-hand panel and the bar at the bottom, so nothing jumps around.

```text
┌──────────────────────────────────────────────────────────────┐
│ ←  Island count          Grid · BFS     Medium     ⚙        │
├───────────────────────────────┬──────────────────────────────┤
│  Editor                       │  Writing: test cases         │
│  current line highlighted     │  Walking: views, variables,  │
│  while walking                │  call stack                  │
├───────────────────────────────┴──────────────────────────────┤
│  "Neighbor (1,1) is land. Add it to the queue."              │
│  ⏮  ◀  ▶  ▶▶   ━━━━━━━━●━━━━━━━━━━━━━━━  42 / 118   1×      │
└──────────────────────────────────────────────────────────────┘
```

The divider between editor and views can be dragged, and remembers where you left it. When writing, the bottom bar holds **Run tests** and **Walk through**, the only filled button on the screen. When walking, it holds the step controls, with red marks on the timeline for errors and small ticks for function calls.

On a tablet the views sit above the editor. On a phone, walk mode comes first: the views fill the screen, the code shrinks to the current line and two lines around it, and you swipe to step. Editing still works, with a one-time note that a keyboard helps.

## First visit

The landing page shows a binary search walkthrough paused on its last step, with a Play button next to it. It doesn't move until you press it. There's one call to action, **Try a problem**, which opens a warm-up problem with a working solution already filled in, so the first walkthrough is one click away.

After that first walkthrough, a single tip appears: "Use ← and → to step. Now try writing your own." There's no signup wall, tour or pop-up.

## When things go wrong, or right

| Situation | What the learner sees |
|---|---|
| Editor is empty | Pressing Walk through shows "Write a solution first." next to the button. |
| Syntax error | A red underline at the error and a one-line message. In live mode, the last working walkthrough stays up, dimmed. |
| Error while running | The walkthrough opens at the failing step with a plain explanation, such as "grid[4] doesn't exist. The grid has rows 0 to 3." |
| Code runs too long | The partial walkthrough is still available, with a note naming the loop that kept going. |
| Wrong answer | Expected and actual results side by side, with a button to walk through that case. |
| All tests pass | A quiet success message, a quick "how well do you understand this?" rating, and a link to the next problem in the pattern. |
| Offline | Everything except syncing works after the first visit. |

## Views

Stepwise looks at both the data and how your code uses it to decide how to draw each variable. A badge names what it picked, like "Grid + BFS", and you can switch to something else.

| View | When it's used | Ships in |
|---|---|---|
| Array with pointers | An array, plus the integer variables used to index it | First release |
| Grid | An array of equal-length arrays | First release |
| Linked list | Objects connected through `next` | First release |
| Binary tree | Objects with `left` and `right` | First release |
| Hash map or set | A `Map`, a `Set`, or a plain object used for lookups | First release |
| Recursion tree | A function that calls itself | First release |
| General | Anything we don't recognize | First release |
| Graph, DP table, heap, stack, queue, string | Their own patterns | v1 |

## Color and type

The interface uses kbui's default theme. Views get their own colors, and each one comes with a second cue so color is never the only signal.

| Meaning | Color | Also shown by |
|---|---|---|
| Current element | Blue | An outline and a label |
| Visited | Teal | A filled background |
| Changed this step | Amber | A brief underline |
| Error | Red | An icon and text |
| Out of range | Gray | A diagonal hatch |
| Answer path | Rust | A thicker line |

The current-element color is deliberately blue, not kbui's rust accent, because rust sits too close to error red. Numbers in views use fixed-width digits so columns don't shift as values change.

## Writing style

Narration uses the learner's own variable names: "lo moves to 4", not "the left pointer moves". Each sentence is present tense and under 90 characters. Error messages say what happened and what to try next, without apologizing, and tracebacks stay hidden unless the learner asks for them.

## Motion

Animation is there to show what changed between two steps, and nothing else.

Changes take between 80 and 320 ms, and stepping backwards plays them in reverse. At 2× speed or faster, or while scrubbing, changes snap into place instead. Pressing a key mid-animation finishes it immediately, so input never waits. With reduced motion turned on, nothing animates and changed items get a brief outline instead. Nothing moves while you're typing.

All timings come from kbui's motion tokens, so the interface and the views stay in step.

## Keyboard

| Key | Action |
|---|---|
| ⌘/Ctrl + Enter | Run tests |
| ⌘/Ctrl + ' | Walk through |
| ← / → | Previous / next step |
| Shift + → | Step over a function call |
| Alt + → | Next time this line runs |
| Home / End | First / last step |
| Space | Play or pause |
| [ / ] | Slower / faster |
| E | Back to writing |
| P | Problem statement |
| ? | All shortcuts |

The arrow keys only step when you're outside the editor, so they never get in the way of typing.

## Accessibility

We're aiming for WCAG 2.2 AA, checked automatically in CI and by hand with VoiceOver and NVDA before each release.

Everything works from the keyboard with a visible focus ring. Each step's sentence is read out by screen readers, and every view can be switched to a plain table showing the same state. Touch targets are at least 44 px on phones. Text scales to 200% without anything getting cut off. Reduced motion, high contrast and dark mode follow your system settings, and each can be set in the app too.
