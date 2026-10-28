# 0002. Build the interface on kbui and fill its gaps there

## Status

Proposed on 2026-10-27.

## Context

Stepwise needs accessible buttons, dialogs, menus, sliders, tabs, panels and toasts, a light and dark theme, and tokenized motion. [kbui](https://github.com/KhallilB/kbui) already provides most of these on Base UI, with token-only styling enforced by its build. It lacks about 20 pieces Stepwise needs, listed in [Building on kbui](../kbui.md).

## Decision

Build every interface screen with kbui. When a screen needs a component kbui lacks, add it to kbui under kbui's own contract and release it, rather than writing it in Stepwise. Parts that only make sense in Stepwise (the views, playback, narration, detector, runners and editor integration) stay in this repository. Stepwise's own CSS reads only `--kb-*` tokens.

## Options considered

- Build on kbui and fill gaps there: accepted. One design system across projects, and the gaps (Tabs, Table, Drawer, Toast) are ones kbui needs anyway.
- Build on kbui and write missing pieces locally: rejected. The local copies drift and never move upstream.
- A different component library: rejected. It would bring a second look and a second set of rules.

## Consequences

kbui work sits on Stepwise's critical path. We front-load kbui release A (G1–G7) alongside Phase 0 and build views, which need no new components, in parallel. kbui is React-only, so Stepwise uses React.

## Soundness boundary

This record decides ownership. It does not show that kbui's warm default theme suits a learning tool; Phase 0 sessions check first impressions.

## Threat model

Guards against component drift between projects and against a second set of accessibility rules. It does not guard against kbui releases arriving late.

## Non-goals

- Moving Stepwise's views into kbui before a second product needs them.

## Revisit if

- kbui work blocks a Stepwise phase for more than two weeks.
- Phase 0 learners react poorly to the theme and tokens can't fix it.

## Adoption

None yet.

## Validation

- Still to do: kbui release A installs in Stepwise and passes kbui's checks.

## Links

- [Building on kbui](../kbui.md)
- Related: [0003](0003-react-router-on-cloudflare-workers.md), which follows from kbui being React-only
