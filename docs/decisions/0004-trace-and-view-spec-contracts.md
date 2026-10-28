# 0004. Connect runner, detector and renderer through two data formats

**Status:** Proposed 2026-10-27.

## Context

Stepwise will add languages and views over time. If running, detecting and drawing share code, every addition touches everything.

## Decision

The three stages communicate only through two typed formats:

```text
Runner → Trace → Detector → View spec → Renderer
```

A new language produces traces. A new view reads view specs. Each stage is tested on its own with stored examples. See [Technical design](../technical.md#data-formats).

## Alternatives

- **Renderers read runtime values directly.** Every view would need code for every language.
- **One combined format.** View choices would be recomputed on every render, and the v1 model would have no small, checkable output to produce.

## Trade-off

The formats are a contract. Changing them means updating stored test traces deliberately.

## Revisit if

- A v1 view needs data the trace does not carry.
- Traces exceed 50 MB per walkthrough.
