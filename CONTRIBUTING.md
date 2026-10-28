# Contributing

Stepwise is in planning, so contributions today are to the documents in [`docs/`](docs). Setup, commands and checks will be added here with the first code.

## Writing docs

- Write for someone new to the project. Plain sentences, present tense, no unexplained jargon.
- Keep one home per topic: product intent in [product](docs/product.md), testable checks in [requirements](docs/requirements.md), design in [UX](docs/ux.md), data formats in [visualization](docs/visualization.md), build choices in [architecture](docs/architecture.md), order and risks in the [roadmap](docs/roadmap.md). Link instead of repeating.
- Mark anything not yet built or tested as such. Claims about learners stay assumptions until Phase 0 tests them.
- A choice that affects ownership between layers, breaks a data format, or adds a significant dependency gets a [decision record](docs/decisions/README.md).
- Problem statements are written for Stepwise. Don't copy statements, names or numbering from other platforms.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org), for example `docs: add heap view to the catalog`.
