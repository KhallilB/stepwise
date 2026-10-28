# Product

## Problem

Data structures and algorithms are taught through code and notation, but understanding comes from seeing data change. Visual learners struggle because:

- **Execution is invisible.** A loop runs 40 times and only the final result is shown.
- **Debuggers show values, not structure.** `i = 3, j = 7` does not show `i` and `j` as positions in an array.
- **Visualizers use prepared examples.** An animation of BFS does not explain why your BFS visits a cell twice.

## Audience

- **Visual learners** (primary). Self-taught developers and bootcamp graduates who can write basic Python but lose track once indexes, pointers or recursion appear.
- **Interview candidates** who recognize patterns but cannot always explain why a solution works.
- **Computer science students** checking coursework and lecture concepts.
- **Instructors** (v2) who want to share walkthroughs and see where a class gets stuck.

## Core loop

1. Choose a problem.
2. Write a solution.
3. Walk through it as a picture, step by step.
4. Fix and run again.

## Assumptions

These are untested. Phase 0 of the [roadmap](roadmap.md) tests them before development starts.

| Assumption | Fails if |
|---|---|
| Stepping through their own code as a picture helps learners fix bugs faster | Fewer than 5 of 8 participants fix a planted bug faster than with print statements |
| Automatic view selection is accurate enough to trust | The wrong view is chosen for more than 15% of common solutions |
| Python in the browser starts quickly enough | The first walkthrough takes more than 6 seconds on a mid-range laptop |
| Learners step backwards as well as forwards | Fewer than 30% of walkthroughs use step-back or scrub |

## Scope

### First release

- 30 original Python problems covering the common patterns
- Code runs in the browser; progress is stored on the device, and an account is optional
- Walk mode: step, play, scrub and adjust speed
- Six automatic views and a general fallback
- One sentence per step, announced to screen readers
- Jump to the failing step
- Live mode: re-runs while typing and keeps the last working picture if the code breaks

### v1

- Predict mode, which pauses and asks what happens next
- Comparison with a reference solution, showing the first step where they differ
- Select a value to jump to the step that last changed it
- Graph, dynamic programming table, heap, stack, queue and string views
- JavaScript and TypeScript
- Learner-supplied problems
- Shareable walkthrough links

### v2

- Java, C++, Go and Rust
- Instructor tools

### Out of scope

- A large problem catalog. Thirty well-visualized problems are the priority.
- Contests, rankings and social features.
- A full IDE with files, packages or a terminal.
- Code editing on phones. Phones support viewing and stepping.

## Success measures

| Measure | Target |
|---|---|
| New visitors who complete a walkthrough in their first session | 60% |
| Median time from landing to first visualization | Under 60 s |
| Walkthroughs that use step-back, scrub or jump | 40% |
| Learners who return within 7 days | 25% |
| Walkthroughs where the learner keeps the selected view | 85% |

## Acceptance criteria

Each first-release feature is complete when its check passes.

| Feature | Acceptance check |
|---|---|
| Problem library | Loads in under 100 ms; every problem opens with Tab and Enter |
| Editor | No input lag in a 200-line file; drafts survive a reload |
| Run tests | Results in under 500 ms once Python is loaded |
| Walk through | A 5,000-step trace is ready in under 400 ms and opens at step 1 |
| Stepping | Each step renders within one frame; scrubbing stays above 50 fps |
| Synchronization | Line, picture, variables and sentence always reflect the same step, verified by test |
| Automatic views | The intended view is chosen for every reference solution |
| Narration | Every step has a sentence |
| Jump to failure | Planted bugs open at the correct step |
| Live mode | No blank frames during a minute of continuous typing |
| Accounts | Signing in preserves all prior progress |
| Runaway code | `while True: pass` never freezes the tab |

## Content policy

All problem statements are written for Stepwise. Well-known problems may inspire them, but no text, names or numbering are copied from other platforms.
