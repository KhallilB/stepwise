# 0001. Run learner code in the browser with Pyodide

**Status:** Proposed 2026-10-27. Load time is tested in Phase 0.

## Context

Every walkthrough needs a full trace of the learner's code. The first release must work without an account, work offline after the first visit, and stop runaway code safely.

## Decision

Run Python with Pyodide in a Web Worker and trace it with `sys.settrace`. The worker has no access to the page or the network. Step, time and memory limits stop runaway code, and an interrupt flag lets the Stop button respond within 100 ms.

## Alternatives

- **Server sandbox per run.** Costs money per run and adds latency to every step. Kept as the v2 path for other languages.
- **Python-to-JavaScript translators.** Behave differently from real Python, so learners would hit bugs that aren't theirs.

## What it costs

The first visit downloads several megabytes. Stepwise loads it in the background and caches it.

## Revisit if

- The first walkthrough takes more than 6 seconds on a mid-range laptop.
- Tracing 5,000 steps takes more than 400 ms.
