# Roadmap

We only build Stepwise if early testing shows the idea helps. The roadmap is a series of milestones, done one at a time in the order below. Each milestone ends in a demo, with a pass mark set before the work starts and evidence we keep. Each milestone is broken into slices: small pieces that each work end to end and have their own check.

Stepwise is built by one person. Targets run up to the go or no-go at M3, and we'll estimate the rest once M3 shows what's worth building. Weeks count from the day M1 starts.

## Milestones

Status on 2026-10-28.

| | Milestone | Phase | Slices | Target | Status |
|---|---|---|---|---|---|
| M0 | Design published | — | — | Done | Passed |
| M1 | Clickable prototype | 0 · Validate | 3 | Week 2 | In progress |
| M2 | JavaScript tracing check | 0 · Validate | 2 | Week 2 | Not started |
| M3 | Learner study | 0 · Validate | 3 | Week 5 | Not started |
| M4 | Run and trace | 1 · Core | 2 | Set after M3 | Not started |
| M5 | kbui release A | 1 · Core | 2 | Set after M3 | Not started |
| M6 | First real walkthrough | 1 · Core | 3 | Set after M3 | Not started |
| M7 | All six views | 2 · First release | 6 | Set after M3 | Not started |
| M8 | Feedback loop | 2 · First release | 3 | Set after M3 | Not started |
| M9 | kbui release B | 2 · First release | 2 | Set after M3 | Not started |
| M10 | Full library, accessible | 2 · First release | 7 | Set after M3 | Not started |
| M11 | Private beta | 2 · First release | 3 | Set after M3 | Not started |
| M12 | v1 | 3 · v1 | Set after M11 | Set after M3 | Not started |
| M13 | v2 | 4 · v2 | Set after M12 | Set after M12 | Not started |

M3 is the go or no-go point. If it fails, we stop or rethink before writing product code.

The order follows three rules:

- **Settle the cheapest big unknown first.** M2 runs straight after the prototype, and its runner is reused by the study and by M4.
- **Build kbui components just before the milestone that needs them.** Nothing in kbui is built for Stepwise until M3 says go.
- **Start slow, waiting work early.** Recruiting for M3 (slice 3.1) starts during M1, so people are booked by the time the study kit is ready.

## How we know something is done

- **A slice is done** when its check passes and it's merged.
- **A milestone is done** when all its slices are done, the demo has been run, and the pass mark has been checked against it. The pass mark is checked on the finished demo because slices can each work and still fail together.

Every milestone and every slice has an entry in [`progress.json`](../progress.json). Slice entries have `kind` set to `slice` and `subject` set to their milestone. Each entry stays `not-run` until someone checks it, then records the date, the result, what was measured, links to the evidence and the commit. A milestone can't be marked passed while any of its slices hasn't. Nothing is marked done on someone's word alone, and a failed check is recorded as a failure, not deleted. When a check fails, we add a slice to fix it.

## Phase 0 · Validate

### M0 · Design published

The product, design and technical docs are public in this repository.

- **Demo:** open the [docs](README.md).
- **Pass mark:** every page in the docs index exists, and every link resolves.
- **Evidence:** this repository.

### M1 · Clickable prototype

A browser prototype that walks through three problems using traces we write by hand. No learner code runs yet. It's enough to put in front of learners.

- **Demo:** open the preview link, pick a problem, step forward and back through a planted bug.
- **Pass mark:** all three problems can be walked forward and back with the line, picture and sentence in sync, on a public preview link.
- **Evidence:** the preview link and a short screen recording.

| | Slice | Done when |
|---|---|---|
| 1.1 | Binary search walkthrough: array view with `lo`, `mid` and `hi`, step forward and back, current line and one sentence per step | An end-to-end test steps to the planted off-by-one and back, with the line, picture and sentence matching at every step |
| 1.2 | Sorted pair sum, and a problem picker | The same test passes for a planted bug where a pointer moves the wrong way |
| 1.3 | Island count, with the grid view and the queue beside it, then publish | The same test passes for a planted off-by-one bounds check, and the preview link is public |

### M2 · JavaScript tracing check

A throwaway test page that rewrites JavaScript to call a tracing hook and runs it in a worker. It answers whether tracing this way is faithful and fast before we depend on it.

- **Demo:** run the three prototype problems and their planted bugs traced and untraced, side by side, with the timings on screen. Then run `while (true) {}` and press Stop.
- **Pass mark:** traced and untraced runs give the same result on every test, a 5,000-step trace is ready in under 400 ms on a mid-range laptop, and Stop ends an infinite loop within 100 ms.
- **Evidence:** the benchmark script and its results, in `research/`.

| | Slice | Done when |
|---|---|---|
| 2.1 | Trace the three prototype problems: rewrite with Acorn, run in a worker, record steps in the trace format | Traced and untraced runs match on every test, and the binary search trace matches M1's hand-written one |
| 2.2 | Limits and timing: step cap, Stop, and a 5,000-step benchmark | 5,000 steps trace in under 400 ms, and Stop ends `while (true) {}` within 100 ms |

### M3 · Learner study

Eight sessions with visual learners using the M1 prototype. Each fixes a planted bug once with Stepwise and once with `console.log`.

- **Demo:** the study write-up, with timings for every participant.
- **Pass mark:** at least 5 of 8 fix the bug faster with Stepwise, and at least 30% of walkthroughs use step-back or scrub.
- **Evidence:** the study report in `research/`, with session notes and recordings kept privately.

| | Slice | Done when |
|---|---|---|
| 3.1 | Recruit: a screener that also asks which language each person practices in. Starts during M1. | Eight participants are booked |
| 3.2 | Study kit: edit and run tests using the M2 runner untraced, a `console.log` version for comparison, a timer and a log of every step and run | A dry run with one person exports timings and step-back counts |
| 3.3 | Run the eight sessions and write the report | The report is in `research/` and the result is recorded |

## Phase 1 · Core

### M4 · Run and trace

The real JavaScript runner and tracer, grown from the M2 test page, with traces stored and replayable.

- **Demo:** paste a solution into a bare test page, run it, and print the trace. Then run `while (true) {}` and press Stop.
- **Pass mark:** traces for two problems match their stored copies exactly, a 5,000-step trace is ready in under 400 ms, and Stop ends an infinite loop within 100 ms without freezing the tab.
- **Evidence:** CI run with the stored-trace and runaway-code tests.

| | Slice | Done when |
|---|---|---|
| 4.1 | The runner, with stored traces for binary search and sorted pair sum | CI compares both traces with their stored copies, and traced against untraced runs |
| 4.2 | Step, time and memory limits, Stop, and a worker with no network access | The runaway-code tests and the 5,000-step benchmark pass in CI |

### M5 · kbui release A

The first batch of kbui components Stepwise needs: visualization colors, resizable panels, the timeline slider, tabs, key labels, the screen-reader announcer and code colors (G1 to G7 in [Building on kbui](kbui.md)).

- **Demo:** each new component in kbui's Storybook.
- **Pass mark:** a tagged kbui release with all seven, passing kbui's checks, installed in Stepwise from its release tarball.
- **Evidence:** the kbui release page and its CI run.

| | Slice | Done when |
|---|---|---|
| 5.1 | G1 to G7, built and tracked in the kbui repository | Each is merged in kbui with its story, tests and accessibility scan |
| 5.2 | Tag the release and install it in Stepwise | Stepwise builds and passes its tests against the release tarball |

### M6 · First real walkthrough

The editor, step controls, and the array and grid views, working on real code end to end.

- **Demo:** on the preview link, write a binary search with an off-by-one bug, walk through it, and watch the pointers miss the target.
- **Pass mark:** two problems work end to end. Each step draws in under 8 ms and scrubbing 5,000 steps stays above 50 fps.
- **Evidence:** the preview link, a screen recording and the performance benchmark from CI.

| | Slice | Done when |
|---|---|---|
| 6.1 | Editor and Run tests: JavaScript editing, saved drafts, expected and actual results | Results appear within 500 ms, and a reload brings the draft back |
| 6.2 | Walk through on real code with the array view and the timeline | Binary search works end to end from code the learner typed |
| 6.3 | Grid view on real code, and the drawing benchmark | Island count works end to end, and the 8 ms and 50 fps targets pass in CI |

## Phase 2 · First release

### M7 · All six views

The linked list, binary tree, hash map and recursion tree views join array and grid, and Stepwise starts choosing views on its own.

- **Demo:** walk through one problem of each kind and watch the badge name the right view.
- **Pass mark:** the intended view is chosen for all 30 reference solutions, and the wrong one for no more than 15% of a set of common learner solutions.
- **Evidence:** CI run with the view-choice tests and the learner-solution results.

| | Slice | Done when |
|---|---|---|
| 7.1 | Linked list view | Screenshot tests at fixed steps pass in light and dark |
| 7.2 | Binary tree view | Screenshot tests pass in light and dark |
| 7.3 | Hash map and set view | Screenshot tests pass in light and dark |
| 7.4 | Recursion tree view | Screenshot tests pass in light and dark |
| 7.5 | Reference solutions for all 30 problems, each tagged with its intended view | All 30 run and have a stored trace |
| 7.6 | Automatic view choice, the badge, and switching or pinning a view | The M7 pass mark is met |

### M8 · Feedback loop

Narration, jump to failure and live mode.

- **Demo:** introduce a bug, run the tests, and land on the failing step with a sentence explaining it. Then turn on live mode and fix the bug while the picture updates.
- **Pass mark:** every planted bug (five per problem) opens at a useful step, no step is missing a sentence, and a minute of continuous typing in live mode never shows a blank view.
- **Evidence:** CI run with the planted-bug suite and the live-mode test.

| | Slice | Done when |
|---|---|---|
| 8.1 | Narration from templates for each kind of action | No step is missing a sentence, and screen readers announce each one |
| 8.2 | Jump to failure | Every planted bug written so far opens at a useful step |
| 8.3 | Live mode | A minute of continuous typing never shows a blank view |

### M9 · kbui release B

The rest of the first-release components: drawer, table, toast, popover, collapsible section, loading placeholder, empty state, keyboard shortcuts and split layouts (G8 to G15 and G20).

- **Demo:** each new component in kbui's Storybook.
- **Pass mark:** a tagged kbui release with all nine, passing kbui's checks, installed in Stepwise.
- **Evidence:** the kbui release page and its CI run.

| | Slice | Done when |
|---|---|---|
| 9.1 | G8 to G15 and G20, built and tracked in the kbui repository | Each is merged in kbui with its story, tests and accessibility scan |
| 9.2 | Tag the release and install it in Stepwise | Stepwise builds and passes its tests against the release tarball |

### M10 · Full library, accessible

All 30 problems in the library, and the product checked for accessibility.

- **Demo:** complete a problem from the library to a passing solution using only the keyboard, then again with VoiceOver on.
- **Pass mark:** 30 problems live, no automated accessibility violations on any screen, the keyboard-only test passes, and a manual VoiceOver and NVDA check finds no blocking issues.
- **Evidence:** CI run with the accessibility scans, and the manual check notes.

| | Slice | Done when |
|---|---|---|
| 10.1 | Library page and problem statement drawer | The list loads in under 100 ms, and every problem opens with Tab and Enter |
| 10.2 | Problems 1 to 6: statement, starter code, tests and five planted bugs each | Each passes its planted-bug and view-choice tests |
| 10.3 | Problems 7 to 12 | Same as 10.2 |
| 10.4 | Problems 13 to 18 | Same as 10.2 |
| 10.5 | Problems 19 to 24 | Same as 10.2 |
| 10.6 | Problems 25 to 30 | Same as 10.2 |
| 10.7 | Accessibility pass: automated scans, keyboard-only run, VoiceOver and NVDA | The M10 pass mark is met |

### M11 · Private beta

Fifty learners using the first release.

- **Demo:** the beta dashboard showing real usage.
- **Pass mark:** 50 learners invited and active, at least 99.5% of sessions without a crash, and all [success measures](product.md#how-well-measure-it) reported after two weeks.
- **Evidence:** the beta report with dashboard snapshots.

| | Slice | Done when |
|---|---|---|
| 11.1 | Progress saved on the device, and sign-in that syncs it | Signing in after solving three problems keeps all three marked as solved |
| 11.2 | Crash reporting and the analytics events | Every success measure can be read from the dashboard |
| 11.3 | Invite 50 learners, run for two weeks, write the report | The M11 pass mark is checked and recorded |

## Phase 3 · v1

### M12 · v1

Predict mode, comparison with a reference solution, click-to-jump, graph, DP table and heap views, TypeScript and Python, pasted problems, and share links. We'll break it into slices after M11.

- **Demo:** a shared link that opens someone else's walkthrough at a chosen step.
- **Pass mark:** in beta, 60% of new visitors finish a walkthrough in their first session and 25% return within a week.
- **Evidence:** the v1 beta report.

## Phase 4 · v2

### M13 · v2

More languages running on our servers, and tools for instructors. We'll set the scope, slices and pass mark after M12, based on what v1 teaches us.

## Risks

| Risk | What we'll do about it |
|---|---|
| Stepwise picks the wrong view and learners stop trusting it | Set views per problem, show the choice, make switching one click, and fall back to the general view when unsure |
| Rewriting code to trace it changes how it behaves | Run every reference solution and planted bug traced and untraced in CI, and fail on any difference. M2 checks this early. |
| Learners preparing for interviews want Python | Ask study participants which language they practice in, and bring Python forward if most say Python |
| One person is the bottleneck, and the timeline slips | Keep slices small, finish one milestone before starting the next, and cut scope before cutting checks |
| Big inputs make traces too large | Use small inputs for walkthroughs, cap the steps, and store traces compactly |
| Animation slows experienced users down | Snap at higher speeds, let any keypress cut an animation short, offer reduced motion |
| Bigger platforms add visuals of their own | Compete on how good the views, narration and failure diagnosis are, not on problem count |
| Problem content causes legal trouble | Write every problem ourselves |
| kbui work holds up Stepwise | Build each kbui group just before the milestone that needs it, and keep components small |
| kbui's warm visual style feels wrong for learning | Keep data colors separate from the theme, check reactions in M3, and adjust tokens if needed |

## Open questions

- How do we make money: a free core with paid extras, or licenses for schools and bootcamps?
- Do interview candidates need Python sooner than v1?
- If a learner hasn't written anything yet, should Walk through show a reference solution?
- How much should narration explain, and how much should it ask the learner to work out?
- Is a desktop app worth building later for offline use?
