# Product

Stepwise is a practice space for data structures and algorithms where you write a solution and watch it run, one step at a time, drawn the way you would sketch it on a whiteboard.

This document is the home for what Stepwise is for, who it serves and what it will not do. [Requirements](requirements.md) turn the MVP into testable checks, and the [roadmap](roadmap.md) orders the work.

Status on 2026-10-27: draft v0.1. No code exists. Every claim about learner behavior below is an assumption until Phase 0 tests it.

## The loop

```text
Pick a problem  →  Write code  →  Walk through  →  Fix and repeat
```

A learner picks a problem, writes a solution and presses **Walk through**. Their code runs in the browser with tracing on. Stepwise detects what the data is (a grid, an array with two pointers, a linked list, a tree) and draws it that way, with one plain sentence per step. When a test fails, the walk opens at the step where things went wrong.

## The problem

- **The work is invisible.** A loop runs 40 times in a blink. The learner sees only the final output, so the cause of a wrong answer stays hidden.
- **Notation is a barrier.** Σ, big-O and index arithmetic describe loops in a second language that many self-taught learners never learned.
- **Debuggers don't fit the job.** A debugger lists `i = 3, j = 7`. A learner needs to see `i` and `j` as arrows on the array.
- **Visualizers are disconnected from practice.** Watching a canned BFS animation is different from understanding why *your* BFS visits a cell twice.

## Assumptions to test

The roadmap opens with a two-week validation phase. If A1 fails, the project stops or is rethought before anything is built.

| | Assumption | How we test it | Fails if |
|---|---|---|---|
| A1 | Visual learners solve more problems when they can step through their own code drawn as a picture. | Timed seeded-bug task, Stepwise against print statements | Fewer than 5 of 8 participants fix the bug faster with Stepwise |
| A2 | Auto-detected views are right often enough that people trust them. | Run the detector on common solutions to the 30 MVP problems | Wrong primary view in more than 15% of them |
| A3 | Python in the browser starts fast enough. | Cold start on a mid-range laptop over 4G | Over 6 s to the first walkthrough |
| A4 | Learners step backwards, not only forwards. | Session recordings in Phase 0 | Fewer than 30% of walks use step-back or scrub |

## Who it serves

| Persona | Situation | What they need |
|---|---|---|
| Visual learner (primary) | Self-taught or bootcamp graduate. Comfortable with basic Python, lost once indexes, pointers or recursion appear. | See state change, connect each line to its effect, learn notation by seeing it. |
| Interview prepper | Grinding problems before interviews. Knows patterns by name, can't always explain why a solution works. | Fast feedback on wrong answers, pattern recognition, keyboard-first speed. |
| CS student | Taking a data structures course with homework in Python. | Understand lecture concepts by running them, check edge cases. |
| Instructor (v2) | Teaches a course or bootcamp cohort. | Shareable walkthroughs, assigned problem sets, a view of where a cohort gets stuck. |

### Jobs to be done

- When my answer is wrong, show me the exact moment my code did something I didn't expect.
- When I read a solution I don't understand, let me watch it run on a small input.
- When I learn a new pattern (two pointers, BFS, DP), show me what it looks like so I recognize it next time.

## Goals

- Make the effect of every line of a learner's code visible in a form that matches how DSA is taught.
- Keep the interface simple enough that a first-time visitor completes a walkthrough within 60 seconds, with no signup.
- Feel fast and calm: instant stepping, smooth motion, no flicker while typing.

## Non-goals for the MVP

- Competing on problem count. 30 well-chosen problems beat 3,000 with no visuals.
- Contests, rankings or social feeds.
- Languages other than Python. JavaScript and TypeScript come in v1, others in v2.
- A full IDE. No files, no packages, no terminal.
- Editing code on a phone. Phones get read-and-step mode.

## Success metrics

| Metric | Definition | MVP target |
|---|---|---|
| Activation | New visitors who complete one full walkthrough in their first session | ≥ 60% |
| Time to first picture | Landing to first rendered step, median | ≤ 60 s |
| Active stepping | Walkthroughs that use step-back, scrub or click-to-jump | ≥ 40% |
| Fix after walk | Failed runs followed by a pass within 10 minutes, among learners who opened a walk | ≥ 15 points above those who didn't |
| D7 return | Learners who come back within 7 days | ≥ 25% |
| Understanding | "I understand why my solution works", 1–5 prompt after solving | Median ≥ 4 |
| View accuracy | Walks where the learner keeps the detected primary view | ≥ 85% |

Guardrails: crash-free sessions ≥ 99.5%, p75 Interaction to Next Paint ≤ 100 ms, runner timeouts ≤ 2% of runs.

## Principles

| Principle | What it means in practice |
|---|---|
| Three screens, one primary action each | Library: pick. Workspace: walk through. Walk mode: step. A feature that needs a fourth screen waits. |
| One step, one moment | The highlighted line, the picture, the variables and the sentence always describe the same instant. Nothing lags. |
| Only what changed moves | Motion directs the eye. Everything that didn't change this step stays still. |
| Never go blank | Broken code keeps the last good picture on screen, dimmed, with a quiet badge. |
| Draw it like a teacher would | Pointers are labeled arrows, grids are grids, trees are trees. The generic memory diagram is the fallback. |
| Words beside pictures | Every step has one plain sentence, with no jargon the problem itself didn't introduce. |
| The learner can always override | Any automatic choice (view, speed, input) is one click to change and stays changed. |

## Scope by release

| Capability | Release | Notes |
|---|---|---|
| Problem library, 30 original problems | MVP | Arrays, two pointers, sliding window, binary search, stacks, queues, linked lists, trees, grids, recursion, hashing |
| Python editor and test runner in the browser | MVP | Pyodide in a Web Worker |
| Walk mode with step controls and scrubber | MVP | Forward, back, play, speed, keyboard |
| Six auto-detected views and a generic fallback | MVP | See the [view catalog](visualization.md#view-catalog) |
| Step narration | MVP | Template-based, announced to screen readers |
| Jump to failure | MVP | Exception step or wrong return |
| Live mode while typing | MVP | Off by default |
| Local progress, no account | MVP | IndexedDB; optional sign-in syncs |
| Predict mode | v1 | Pause and ask "which cell is visited next?" |
| Divergence diff | v1 | First step where your state differs from a reference solution |
| Click data to time-travel | v1 | Click a cell to jump to the step that last changed it |
| Graph, DP table, heap, stack and queue, string views | v1 | |
| Complexity strip and notation bridge | v1 | Operation count against input size; Σ on hover over loops |
| JavaScript and TypeScript | v1 | Instrumented, run in a worker |
| Bring your own problem | v1 | An LLM proposes a view spec from a pasted statement |
| Shareable walkthrough links | v1 | Read-only, open at a chosen step |
| Java, C++, Go, Rust | v2 | Server sandbox with the Debug Adapter Protocol |
| Instructor mode | v2 | Problem sets, cohort insights |

## Content

Every problem statement is written for Stepwise. Classic problems are fine as ideas, but no statements, numbering or names are copied from other platforms.
