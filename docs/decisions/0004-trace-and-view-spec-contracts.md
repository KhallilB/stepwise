# 0004. Separate runner, detector and renderer with two data formats

## Status

Proposed on 2026-10-27.

## Context

Stepwise will add languages (JS/TS in v1, more in v2) and views (graph, DP table, heap in v1). If runners, detection and drawing share code paths, each new language or view touches everything.

## Decision

Three layers talk only through two typed formats:

```text
Runner → Trace → Detector → View spec → Renderer
```

The [trace](../visualization.md#trace) is language-neutral: steps, frames, locals and a heap with stable ids. The [view spec](../visualization.md#view-spec) says which views to draw and what each binds to. A new language writes traces; a new view reads view specs.

## Options considered

- Two explicit formats: accepted. Each layer can be tested alone with golden files.
- Renderers that read runtime objects directly: rejected. Every view would need per-language code.
- One combined format: rejected. Detection results would be re-derived on every render, and the v1 LLM path would have nothing small to produce.

## Consequences

The formats are a contract. Changing them means updating golden traces and view-spec tests on purpose. The LLM in v1 produces only a view spec, which is validated against the schema and never executed.

## Soundness boundary

This record fixes the boundaries. It does not show the trace format is rich enough for v1 views; the graph and DP table views will test that.

## Threat model

Keeps LLM output as data: a view spec can't run code. It does not guard against a wrong but valid view spec.

## Non-goals

- A public trace format for other tools.

## Revisit if

- A v1 view needs data the trace doesn't carry and can't derive.
- Snapshot plus delta storage can't meet the 50 MB per walk budget.

## Adoption

None yet.

## Validation

- Still to do: golden traces and golden view choices for every MVP problem.

## Links

- [Visualization system](../visualization.md)
