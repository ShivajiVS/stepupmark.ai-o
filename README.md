# stepupmark.ai

Production foundation for the stepupmark web application: React Router in framework mode,
server state owned by TanStack Query, validated boundaries, and a shadcn/ui design system.

There are no business features here yet. What exists is the infrastructure plus one thin
example slice (`/sign-in`, `/register` and `/forgot-password`) that exercises every layer end
to end, and a single authenticated page (`/app`) behind a collapsible sidebar.

## Prerequisites

- Node **>= 22.22.1** (`lint-staged`'s floor; React Router v8 itself only needs 22.22.0).
  `.nvmrc` pins the version this project is developed and tested on (24.8.0).
- pnpm **10.20.0** (pinned via `packageManager`).

## Setup

```bash
pnpm install
cp .env.example .env
pnpm dev
```

There is no backend yet. `VITE_ENABLE_MSW=true` serves the API contract from
`src/mocks/handlers.ts` in the browser. Sign in with `ada@example.com` / `password123`.

`pnpm install` also runs `prepare`, which installs the git hooks (Husky): a pre-commit hook
lints and formats staged files, and a commit-msg hook enforces
[Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, …).

## Environment

| Variable          | Purpose                                                     |
| ----------------- | ----------------------------------------------------------- |
| `VITE_API_URL`    | Base URL for the API client. Validated as a URL at startup. |
| `VITE_ENABLE_MSW` | `true` serves the mock API in the browser.                  |

Vite inlines every `VITE_*` variable into the client bundle, so none of them are secrets.
Server-only secrets must not use the `VITE_` prefix. All reads go through
`src/app/config/env.ts`, which parses them with Zod and fails fast.

## Commands

| Command                       | Purpose                                        |
| ----------------------------- | ---------------------------------------------- |
| `pnpm dev`                    | Dev server with HMR                            |
| `pnpm build`                  | Production build, including prerendered routes |
| `pnpm start`                  | Serve the production build                     |
| `pnpm typecheck`              | Route typegen, then `tsc --noEmit`             |
| `pnpm lint`                   | ESLint                                         |
| `pnpm format`                 | Prettier write                                 |
| `pnpm test` / `pnpm test:run` | Vitest (watch / once)                          |
| `pnpm e2e`                    | Playwright                                     |
| `pnpm knip`                   | Find unused files, exports and dependencies    |

## Architecture

```
src/
├── root.tsx            document shell, providers, global error boundary
├── routes.ts           flatRoutes() — file conventions drive the route tree
├── entry.client.tsx    hydration, starts MSW when enabled
├── routes/             route modules, thin; colocated *.test.tsx are not routes
├── app/                env config, query client, providers
├── features/           business domains (auth), each with an index.ts surface
├── components/ui       shadcn/ui — project-owned source
├── components/common   LoadingState, EmptyState, ErrorState
├── components/layout   SiteHeader, AppShell
├── services/api        the one axios client, error normalization, token refresh
├── hooks/  lib/        genuinely shared helpers
├── mocks/              MSW contract, shared by dev, Vitest and Playwright
└── styles/app.css      Tailwind v4 tokens (CSS-first config)
```

Dependency direction is `routes → features → components → services/lib`, enforced by
`no-restricted-imports` in the ESLint config. Features are imported through their index,
never by reaching into their internals.

## Rendering

Configured per route in `react-router.config.ts`, not globally:

- `/` and `/about` are **prerendered** to static HTML at build time. They hold no
  per-request data.
- `/sign-in`, `/register` and `/forgot-password` are **client-rendered** via `clientLoader`,
  so no credential field is ever live markup before React attaches.
- `/app/*` is **client-rendered** via `clientLoader`. Its data is private and personalised,
  and the access token lives only in browser memory.

`ssr: true` means the production build needs a Node 22+ host (`pnpm start` runs
`react-router-serve`). Static hosting alone is not enough.

## State ownership

One source of truth per kind of state:

| State                           | Owner          |
| ------------------------------- | -------------- |
| Server data                     | TanStack Query |
| URL / shareable state           | nuqs           |
| Local UI state                  | React          |
| Routing, navigation, boundaries | React Router   |

There is no global client store. Zustand is not installed, and should not be added until
something genuinely needs client state that is neither server data nor URL state.

## Testing

- **Vitest + Testing Library** for behaviour: schemas, error normalization, the single-flight
  refresh, the sign-in / register / forgot-password forms, and the app shell.
- **MSW** is the single API contract, shared by dev, unit tests and E2E.
- **Playwright** for critical journeys only: sign-in, registration, the protected-route
  redirect round trip, and the sidebar layout from 320px to 4K.

Queries use accessible roles. No snapshots, no assertions on internal state.
