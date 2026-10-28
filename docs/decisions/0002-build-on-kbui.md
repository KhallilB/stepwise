# 0002. Build the interface on kbui

**Status:** Proposed 2026-10-27.

## Context

Stepwise needs accessible controls, light and dark themes and consistent motion. [kbui](https://github.com/KhallilB/kbui) provides most of these and is shared across projects. It lacks about 20 components Stepwise needs.

## Decision

Build every screen with kbui. Add missing components to kbui, not to Stepwise. Keep Stepwise-specific code (views, runners, detector, narration) in this repository.

## Alternatives

- **Build missing components locally.** Faster at first, but local copies drift and are never moved upstream.
- **Use another component library.** Introduces a second look and a second set of rules.

## Trade-off

kbui work is on Stepwise's critical path. It starts during Phase 0, and views are built in parallel. Because kbui is React-only, Stepwise uses React.

## Revisit if

- kbui work delays a Stepwise phase by more than two weeks.
- Phase 0 participants respond poorly to the visual style and token changes cannot fix it.
