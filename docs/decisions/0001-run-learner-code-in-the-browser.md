# 0001. Run learner code in the browser with Pyodide

## Status

Proposed on 2026-10-27. Assumption A3 is tested in Phase 0.

## Context

Every walkthrough needs a full trace of the learner's code: each line, the call stack, the locals and the heap. The MVP is Python-only and must work without an account, offline after the first visit, and with stepping that feels instant. Running code also has to be safe: learner code can loop forever, eat memory, or try to reach the network.

## Decision

Run Python with Pyodide inside a Web Worker and trace it with `sys.settrace`. The page is served cross-origin isolated so a `SharedArrayBuffer` flag can interrupt a run within 100 ms. The worker has no DOM, no network helpers, and a content security policy that blocks `connect-src`. Step, time and memory caps end runaway code.

## Options considered

- Pyodide in a worker: accepted. Real CPython, no server cost per run, works offline, and the sandbox is the browser's own.
- Server sandbox per run: rejected for the MVP. It costs money per run, needs an account or rate limit before the first walk, and adds latency to every step of live mode. It stays the path for v2 languages.
- A Python-to-JS transpiler such as Skulpt or Brython: rejected. Semantics drift from CPython, and learners would hit bugs that aren't theirs.

## Consequences

The first visit downloads several megabytes of runtime. We preload it during idle time on the landing page and cache it with a service worker. Cross-origin isolation constrains what third-party resources the app can load; every page must render under `require-corp`.

## Soundness boundary

This record decides where code runs. It does not show that cold start meets the 5 s budget on real hardware and networks; only the Phase 0 measurement for A3 can.

## Threat model

Guards against learner code reaching the network, the DOM or other tabs, and against a frozen tab. It does not guard against a Pyodide or browser sandbox escape.

## Non-goals

- Running packages that need native extensions beyond what Pyodide ships.
- A general-purpose Python environment with files or a terminal.

## Revisit if

- Cold start to first walk takes over 6 s on a mid-range laptop over 4G (A3 fails).
- Tracing 5,000 steps takes over 400 ms with `sys.settrace`.
- v2 server runners turn out cheap enough to serve Python too, with no loss of offline use.

## Adoption

None yet. No code exists.

## Validation

- Still to do: measure cold and cached start in Phase 0.
- Still to do: the runaway-code tests in [FR-13](../requirements.md#fr-13-runaway-code).

## Links

- [Architecture](../architecture.md)
- [Product assumptions](../product.md#assumptions-to-test)
