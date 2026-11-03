# Contributing

Stepwise is an early prototype. The design lives in [`docs/`](docs); browser apps live in `apps/interview-lab` and `apps/stepwise`; desktop shell lives in `apps/desktop`.

## Setup

Install [Bun](https://bun.sh) 1.3.11, then:

```bash
bun install --frozen-lockfile
bun run --cwd apps/interview-lab test:install webkit
bun run dev        # lab at http://localhost:5173
bun run dev:stepwise # algorithms at http://localhost:5174
bun run desktop:dev # local desktop shell and bundled reviewer
bun run check      # kbui version guard, lint, types, unit and end-to-end tests
```

| Command | What it does |
|---|---|
| `bun run test` | Unit tests (Vitest) |
| `bun run test:e2e` | Browser tests (Playwright); starts the dev server |
| `bun run typecheck` | Generates Workers and route types, then type-checks |
| `bun run build` | Builds both browser apps |

kbui is installed from npm as `@kb.ui/react`; keep its version synchronized with any other `@kb.ui/*` packages.

See [publishing](docs/publishing.md) for existing PR dependencies, GitHub checks, signed source history and desktop releases. Public app availability lives in [Downloads](docs/downloads.md).

## Documentation guidelines

- Write for a reader new to the project: short sentences, plain words, no unexplained jargon.
- Keep each topic in one place and link to it rather than repeating it.
- Mark anything not yet built or tested as such.
- Record major choices as [decision records](docs/decisions/README.md).
- Write problem statements from scratch. Do not copy text, names or numbering from other platforms.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org), for example `docs: add heap view`.
