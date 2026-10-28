# 0005. Start with JavaScript, traced by rewriting the code

**Status:** Proposed 2026-10-28. Replaces [0001](0001-run-learner-code-in-the-browser.md).

## Context

Every walkthrough needs a full trace of the learner's code. The first release must work without an account, work offline after the first visit, and stop runaway code safely.

Decision 0001 chose Python through Pyodide. That meant a download of several megabytes before the first walkthrough, special headers on every page so Python could be interrupted, and a second runtime next to the app's own TypeScript. Many of the self-taught developers and bootcamp graduates we're building for learned JavaScript first.

## Decision

The first release teaches JavaScript. Python moves to v1.

Learner code runs in a Web Worker. Before it runs, we parse it with Acorn and add a call to a tracing hook before every statement, at every function call and return, and in every loop condition. The hook records the line, the event and the variables in scope, which we know from the parse. Each object gets a stable id the first time the hook sees it.

The hook counts steps and stops the run at 5,000. Stop ends the worker outright and starts a new one, which takes milliseconds because there is no runtime to reload. Network access and `importScripts` are removed from the worker before learner code runs.

## Alternatives

- **Keep Python first.** It's the most common language for coding interviews, but it carries the load-time risk and the extra headers.
- **A JavaScript interpreter written in JavaScript.** Gives full control over each step, but is much slower and lags behind the language.
- **The browser's debugger protocol.** Not available to web pages.

## What it costs

- The code that runs is not exactly the code the learner wrote. CI runs every reference solution and planted bug both traced and untraced, and fails on any difference.
- Learners also meet JavaScript's quirks, such as `==` and needing `Math.floor` for integer division, which have nothing to do with the algorithm.
- Interview candidates who practice in Python wait for v1.

## Revisit if

- A traced run ever gives a different result from an untraced one, and the hook can't be fixed to match.
- Tracing 5,000 steps takes more than 400 ms.
- Most Phase 0 participants say they practice in Python.
