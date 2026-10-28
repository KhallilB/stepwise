# Roadmap

We only build Stepwise if Phase 0 shows the idea actually helps. Estimates assume two engineers and a designer, and we'll revisit them once Phase 0 is done.

## Phases

| Phase | Length | What we deliver | How we know it's done |
|---|---|---|---|
| 0 · Validate | 2 weeks | A clickable prototype with three problems, tested with eight learners against print-statement debugging | Learners fix bugs faster and use step-back. If they don't, we stop or rethink. |
| 1 · Core | 4 weeks | The Python runner, tracing, editor, step controls, and the array and grid views | Two problems work end to end within our performance targets |
| 2 · First release | 5 weeks | The other four views, automatic view choice, narration, jump to failure, live mode, the library and all 30 problems | Every test passes and a private beta with 50 learners is running |
| 3 · v1 | 8 weeks | Predict mode, comparison with a reference solution, click-to-jump, more views, JavaScript and TypeScript, pasted problems, sharing | In beta, 60% of new visitors finish a walkthrough and 25% return within a week |
| 4 · v2 | 10+ weeks | More languages on our servers, tools for instructors | We'll decide based on v1 |

The kbui work runs alongside: G1–G7 during Phase 0 and G8–G20 during Phase 1. [Building on kbui](kbui.md) has the list.

## Risks

| Risk | What we'll do about it |
|---|---|
| Stepwise picks the wrong view and learners stop trusting it | Set views per problem, show the choice, make switching one click, and fall back to the general view when unsure |
| Python is slow to load the first time | Load it in the background, cache it, and keep the editor usable while it loads |
| Big inputs make traces too large | Use small inputs for walkthroughs, cap the steps, and store traces compactly |
| Animation slows experienced users down | Snap at higher speeds, let any keypress cut an animation short, offer reduced motion |
| Bigger platforms add visuals of their own | Compete on how good the views, narration and failure diagnosis are, not on problem count |
| Problem content causes legal trouble | Write every problem ourselves |
| kbui work holds up Stepwise | Start the kbui work early and build the views in parallel |
| kbui's warm visual style feels wrong for learning | Keep data colors separate from the theme, check reactions in Phase 0, and adjust tokens if needed |

## Open questions

- How do we make money: a free core with paid extras, or licenses for schools and bootcamps?
- Which second language do our learners need more, JavaScript or Java?
- If a learner hasn't written anything yet, should Walk through show a reference solution?
- How much should narration explain, and how much should it ask the learner to work out?
- Is a desktop app worth building later for offline use?
