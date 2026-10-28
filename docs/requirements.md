# Requirements

The MVP's functional requirements. Each one ends with the checks that close it; a requirement is done when every check passes, not when the feature looks finished. [Product](product.md) explains why each exists, and [UX](ux.md) shows how it looks.

## FR-1 Problem library

- Shows each problem's title, pattern tag, difficulty and the learner's status: new, attempted or solved.
- Filter by pattern and difficulty; search by title. Filters persist across visits.

**Accept:** the list renders from the local cache in under 100 ms; keyboard users can reach and open any problem with Tab and Enter.

## FR-2 Problem statement

- Statement, examples and constraints sit in a drawer that opens over the editor. Once the learner has opened it, it starts closed.

**Accept:** P toggles the drawer; focus moves into it and returns to the editor on close.

## FR-3 Editor

- Python syntax highlighting, bracket matching, indentation and completion of names in scope.
- Starter code per problem. The draft saves locally after 1 s of idle time.

**Accept:** typing latency stays under 16 ms in a 200-line file; reloading the page restores the draft.

## FR-4 Run tests

- Runs every visible test case off the main thread and shows pass or fail per case, with expected and actual values.

**Accept:** once the runtime is warm, a correct solution to any MVP problem reports results in under 500 ms.

## FR-5 Walk through

- Runs one test case with tracing on and switches the workspace to walk mode. Picks the first failing case, otherwise the first case.
- Records at most 5,000 steps. Past that, the walk keeps what it has and says so.

**Accept:** a 5,000-step trace is ready in under 400 ms; the walk opens at step 1 with line, picture and sentence in sync.

## FR-6 Step controls

- Previous, play or pause, next, scrubber, jump to start and end, speed (0.5×, 1×, 2×, 4×).
- Step over and step out of calls; click a line number to go to the next time that line runs.

**Accept:** each step renders within one frame (under 8 ms of main-thread work); scrubbing across 5,000 steps never drops below 50 fps.

## FR-7 Code and state in sync

- The current line is highlighted. A compact variables panel lists locals; values that changed this step pulse once.
- The call stack shows when depth is above 1.

**Accept:** at every step, the highlighted line, the views and the variables panel come from the same snapshot, checked by an automated test that compares them.

## FR-8 Automatic views

- The detector assigns a view to each relevant variable and lays out at most three primary views. A badge names what it found, such as "Grid + BFS".
- The learner can switch or pin any variable's view. Pins persist per problem.

**Accept:** on every MVP problem's reference solution, the detector picks the intended primary view (golden tests).

## FR-9 Narration

- One sentence per step, from templates keyed on the event: compare, assign, append, pop, call, return, branch taken.

**Accept:** no step has an empty sentence; screen readers announce each one through a polite live region.

## FR-10 Jump to failure

- On an exception, the timeline marks the step and the walk opens there.
- On a wrong answer, the walk opens at the final return and offers "Watch from the start".

**Accept:** end-to-end tests on seeded bugs cover both cases.

## FR-11 Live mode

- When on, edits re-run the current test case 400 ms after typing stops.
- If the code doesn't parse or crashes, the last good walk stays on screen, dimmed, with a "Showing last working run" badge.
- After a re-run, the walk tries to stay on the same line and loop iteration.

**Accept:** no blank frames during 60 s of continuous typing; main-thread long tasks stay under 50 ms.

## FR-12 Progress and accounts

- Everything works without an account. Signing in by email link or GitHub syncs drafts, status and pins.

**Accept:** a learner who signs in after solving 3 problems keeps all 3 marked solved.

## FR-13 Runaway code

- Step cap, 3 s wall-clock limit and memory limit. Stop interrupts within 100 ms.
- The message names the likely cause: "Stopped after 5,000 steps. The loop on line 4 may never end."

**Accept:** `while True: pass` never freezes the tab.
