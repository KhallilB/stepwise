# Roadmap

Development starts only if Phase 0 shows the core idea helps learners. Estimates assume two engineers and one designer.

## Phases

| Phase | Length | Delivers | Exit criteria |
|---|---|---|---|
| 0 · Validate | 2 weeks | Prototype with 3 problems, tested with 8 learners | Learners fix bugs faster with Stepwise and use step-back. Otherwise stop or rethink. |
| 1 · Core | 4 weeks | Python runner, editor, step controls, array and grid views | Two problems work end to end within performance targets |
| 2 · First release | 5 weeks | Remaining views, automatic view selection, narration, live mode, 30 problems | All tests pass; private beta with 50 learners |
| 3 · v1 | 8 weeks | Predict mode, comparison, more views, JavaScript, sharing | 60% activation and 25% weekly return in beta |
| 4 · v2 | 10+ weeks | More languages, instructor tools | Decided by v1 results |

kbui additions ship alongside: G1–G7 during Phase 0, G8–G20 during Phase 1. See [Building on kbui](kbui.md).

## Risks

| Risk | Mitigation |
|---|---|
| The wrong view is chosen and learners lose trust | Per-problem presets, a visible badge, one-click switching, a safe fallback |
| Python is slow to load on first visit | Load in the background, cache it, keep the editor usable meanwhile |
| Large inputs create very large traces | Small sample inputs, a step limit, compact storage |
| Animation slows down experienced users | Snap at high speed, interruptible animation, reduced-motion setting |
| Established platforms add visualizations | Compete on view quality, narration and failure diagnosis |
| Problem content raises legal issues | All problems written in-house |
| kbui work delays Stepwise | Start kbui work early; build views in parallel |

## Open questions

- Business model: a free core with paid features, or institutional licenses?
- Second language: JavaScript or Java?
- Before the learner writes code, should a walkthrough show a reference solution?
- How much should narration explain, and how much should it ask?
- Is a desktop app worth building for offline use?
