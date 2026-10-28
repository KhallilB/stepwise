# 0003. Use React Router 7 on Cloudflare Workers

**Status:** Proposed 2026-10-27. Replaces SvelteKit from an earlier draft.

## Context

kbui requires React 19. The library pages should load fast; the workspace is mostly client-side. Every page needs specific security headers so the Python runtime can be interrupted.

## Decision

Use React 19, Vite and React Router 7 in framework mode, hosted on Cloudflare Workers with D1 for user data.

## Alternatives

- **TanStack Start.** A close alternative, but less established on Workers.
- **SvelteKit.** Not compatible with kbui.
- **Vercel.** Header control and same-origin assets are simpler on Workers.

## Revisit if

- The required headers cannot be kept on every page.
- A later feature needs a long-running server.
