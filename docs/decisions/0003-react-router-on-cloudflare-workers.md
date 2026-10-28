# 0003. Use React Router 7 on Cloudflare Workers

## Status

Proposed on 2026-10-27. Replaces SvelteKit from an earlier draft.

## Context

[0002](0002-build-on-kbui.md) commits Stepwise to kbui, which needs React 19. The app has two kinds of page: library pages that should prerender and load fast, and a client-heavy workspace. Every response must carry COOP and COEP headers so Pyodide can be interrupted ([0001](0001-run-learner-code-in-the-browser.md)).

## Decision

Use React 19 with Vite and React Router 7 in framework mode, deployed to Cloudflare Workers. D1 stores users and progress, KV caches view specs.

## Options considered

- React Router 7 on Workers: accepted. Prerendered routes, simple response headers, and a backend on the same platform.
- TanStack Start: a close alternative, rejected for now as younger on Workers.
- SvelteKit: rejected because kbui is React-only.
- Vercel hosting: rejected; header control and same-origin Pyodide assets are simpler on Workers.

## Consequences

The backend uses Workers' runtime limits and D1's SQLite model. Auth uses Better Auth, which runs on Workers and D1.

## Soundness boundary

This record picks a framework and host. It does not show the library page meets the 120 KB and 1.5 s LCP budgets; Lighthouse CI does.

## Threat model

Not a security decision. Isolation headers are covered by 0001.

## Non-goals

- Server-side rendering of the workspace.

## Revisit if

- Cross-origin isolation can't be kept on every route.
- A v2 requirement needs a long-running server that Workers can't host.

## Adoption

None yet.

## Validation

- Still to do: a CI check that every page renders under `require-corp`.

## Links

- [Architecture](../architecture.md#tech-stack)
