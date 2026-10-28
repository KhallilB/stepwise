# Contributing

Stepwise is an early prototype. The design lives in [`docs/`](docs); the app lives in `app/`.

## Setup

Install [Bun](https://bun.sh) 1.3 or later, then:

```bash
bun install
bunx playwright install chromium
bun run dev        # http://localhost:5173
bun run check      # kbui version guard, lint, types, unit and end-to-end tests
```

| Command | What it does |
|---|---|
| `bun run test` | Unit tests (Vitest) |
| `bun run test:e2e` | Browser tests (Playwright); starts the dev server |
| `bun run typecheck` | Generates Workers and route types, then type-checks |
| `bun run build` | Builds the Cloudflare Worker |

kbui is installed from npm as `@kb.ui/react`; keep its version synchronized with any other `@kb.ui/*` packages.

## Documentation guidelines

- Write for a reader new to the project: short sentences, plain words, no unexplained jargon.
- Keep each topic in one place and link to it rather than repeating it.
- Mark anything not yet built or tested as such.
- Record major choices as [decision records](docs/decisions/README.md).
- Write problem statements from scratch. Do not copy text, names or numbering from other platforms.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org), for example `docs: add heap view`.
