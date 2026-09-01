# CLAUDE.md

Working notes for this repository. Read this before changing anything.

## What this is

The foundation of the stepupmark web app. Infrastructure plus one example slice
(`/sign-in`, `/register`, `/forgot-password`) and a single authenticated page (`/app`)
behind a collapsible sidebar. No real business features yet, and none should be invented to
demonstrate the stack.

## Stack

React 19.2 · React Router 8.3 (framework mode, file-based routes) · Vite 8 ·
TanStack Query 5 · Axios · React Hook Form + Zod 4 · Tailwind 4 (CSS-first) · shadcn/ui ·
Motion · Sonner · nuqs · Vitest + Testing Library · Playwright · MSW · ESLint 10 + Prettier.

Two deliberate version pins — do not "upgrade" them without redoing the analysis:

- **TypeScript is pinned to 6.0.3, not 7.x.** TypeScript 7 exists, but `typescript-eslint`
  declares `typescript <6.1.0`. Moving to 7 silently disables type-aware linting.
- **jsdom is pinned to ^29, not 30.** jsdom 30 requires Node `^24.15.0`; this project's
  floor is 22.22.0. Revisit if the Node floor rises.

`eslint-plugin-jsx-a11y` has no ESLint 10 release; it runs under a scoped
`pnpm.peerDependencyRules` override declared in `package.json`.

## Layout

```
src/root.tsx          document shell + providers + global error boundary
src/routes.ts         flatRoutes(), ignores **/*.test.{ts,tsx}
src/entry.client.tsx  hydration; starts MSW when VITE_ENABLE_MSW is set
src/routes/           route modules — keep these thin
src/app/              env config, query client, providers
src/features/<name>/  a business domain; index.ts is its only public surface
src/components/ui     shadcn/ui, owned by this project
src/components/common LoadingState / EmptyState / ErrorState
src/components/layout SiteHeader / AppShell
src/services/api      axios client, error normalization, token refresh, session
src/lib, src/hooks    genuinely shared helpers, one concern per file
src/mocks/            MSW contract
```

Dependency direction: `routes → features → components → services/lib`. Enforced by
`no-restricted-imports` in `eslint.config.ts`:

- never deep-import `~/features/<name>/<internal>`; import `~/features/<name>`
- `components/**` and `lib/**` must not import from `~/features/**`
- `services/**` must not import from `~/features/**` or `~/components/**`

Folders appear when they have content. There is no `src/stores/`, `src/types/` or
`src/services/analytics/` because nothing needs them yet. Do not create them speculatively —
domain types live with their feature. The root `types/` directory is unrelated: it holds one
ambient declaration for `eslint-plugin-jsx-a11y`, which ships none.

## Routing and rendering

File conventions (`@react-router/fs-routes`): a leading `_` means a layout with **no URL
segment** (`_public`, `_auth`), dots mean nesting (`app._index`), a folder with `route.tsx`
colocates helpers. `$.tsx` is the catch-all.

Rendering is chosen per route in `react-router.config.ts`:

- `/`, `/about` — prerendered to static HTML. No per-request data.
- `/sign-in`, `/register` — server-rendered.
- `/app/*` — client-rendered via `clientLoader`. Private, personalised data, and the access
  token exists only in browser memory.

`ssr: true`, so production needs a Node 22+ host. `splitRouteModules` is `true`, not
`"enforce"` — a `clientLoader` that prefetches into the query cache necessarily shares the
query definition with its component, which `"enforce"` rejects.

Do not add SSR or streaming to a route without a product reason. Do not use React Router's
RSC APIs: they are still `unstable_` in v8.

## Imports

Prettier sorts imports (`@ianvs/prettier-plugin-sort-imports`, configured in
`.prettierrc.json`) — do not hand-order them, and do not fight the sort with manual
reordering. `pnpm format` is the only thing that touches import order.

Groups run: Node builtins → React / React DOM / React Router → third-party → internal, with
internal itself ordered `~/app → ~/features → ~/components → ~/hooks → ~/services → ~/lib`,
then relative imports last. That is the same `routes → features → components → services/lib`
direction as everywhere else in this file — an import block that looks wrong (a `~/lib` import
above a `~/features` one) usually means the boundary is wrong too, not just the formatting.

Reach into a sibling with a single `../`; reach further than that with the `~/` alias, not by
walking up the tree. `no-restricted-imports` in `eslint.config.ts` rejects `../../` — the alias
makes the real location legible without counting dots.

## State ownership

| Kind                              | Owner          |
| --------------------------------- | -------------- |
| Server data                       | TanStack Query |
| Shareable / URL state             | nuqs           |
| Local UI state                    | React          |
| Navigation, boundaries, redirects | React Router   |

No global client store exists. Do not add one for server data. Do not copy query results
into `useState` or Context.

## TanStack Query

Query keys come from a per-feature factory (`src/features/auth/queries.ts`). Never inline a
key in a component. Reusable queries are `queryOptions(...)` so a loader and a component
share one definition — that is what makes `clientLoader` prefetching safe rather than a
second fetch.

Defaults live in `src/app/query/client.ts`: `staleTime` 60s, no retry on 4xx, mutations do
not retry. `getQueryClient()` returns a fresh client on the server (per request) and a
singleton in the browser, so loaders and components share one cache.

Invalidate the narrowest key that changed. Do not invalidate `userKeys.all` after every
mutation.

## HTTP

```
component → query/mutation → feature api → services/api/client → backend
```

Components never import axios. There is one client. Feature API functions parse responses
with Zod before returning, so nothing downstream trusts the wire format.

`services/api/errors.ts` maps every failure onto a discriminated `ApiErrorKind`. Backend
message strings are never shown to users — only `fieldErrors` pass through, onto form
fields. `services/api/auth-refresh.ts` keeps refresh single-flight: concurrent 401s await
one shared promise, a request is retried at most once, and the refresh call itself is never
retried. Never log tokens or `Authorization` headers.

## Forms

React Hook Form + `zodResolver`. Schemas live in the feature (`features/auth/schemas.ts`)
and are the source of truth for both validation and types. Submit through a TanStack
mutation. Map server `fieldErrors` onto fields with `setError`; use `root` for form-level
failures. Validation never goes to a toast — Sonner is for transient confirmations only.

A server-rendered form is live markup before hydration: it will submit natively, and
anything typed into it is discarded when React takes over. Give such forms `method="post"`
so a native submit cannot put field values in the URL, and wrap the controls in a
`<fieldset disabled>` gated on `useHydrated()`. `src/routes/_auth.sign-in.tsx` is the
reference; `_auth.register.tsx` follows the same shape. `e2e/auth.spec.ts` guards the
credential-in-URL regression for both.

## UI components

**No UI is built without shadcn/ui.** Before writing any component, page or section:

1. Check whether a shadcn component already covers it. If one does, use it.
2. Compose pages and sections from shadcn primitives — never assemble styled `div`s by hand.
3. If nothing in the registry fits, **ask before writing a custom component.**

Do not hand-roll what shadcn already provides. A bordered panel is `Card`. An inline failure
is `Alert`. An empty or failed region is `Empty` (see `components/common/`). An off-canvas
panel is `Sheet`. A link that should look like a button is `<Button asChild>`, or
`buttonVariants()` when the child needs its own `className` function. Primitives that nothing
currently uses — `Select`, `Table`, `Pagination` — are not kept on spec; add them back from
the registry when a page needs one.

Add components with `pnpm dlx shadcn@latest add <name>`. If the CLI offers to overwrite a
file that already exists, **decline** — `sidebar` lists `button`, `input`, `separator` and
`skeleton` as registry dependencies and would replace all four (`button.tsx` and `input.tsx`
carry local changes), so it was installed by writing the single registry file by hand and
repointing its imports. `sheet` and `tooltip` were new, so those came from the CLI.

## Styling

Tailwind 4, CSS-first. Tokens are defined once in `src/styles/app.css` under `@theme inline`
with light and dark values. Use semantic utilities (`bg-background`, `text-muted-foreground`,
`rounded-lg`).

No arbitrary or absolute values — no invented borders, radii, spacing or colours, and nothing
like `mt-[17px]` when a scale step exists. Take the value from the tokens or from a shadcn
variant.

Class names stay inline on the element. Never collect them into a variable
(`const page = "bg-slate-400 p-4 m-3"`): that hides them from the Prettier class sorter, from
editor tooling, and from anyone reading the markup.

`src/components/ui/` is **our source code**, not a vendored library:

- reuse what is there; check existing variants before inventing a visual pattern
- never regenerate or blind-overwrite a component during unrelated work
- if an upstream change is genuinely needed, diff it, keep local modifications, apply the
  smallest patch, and test what it touched
- `sonner.tsx` is deliberately modified: upstream pulls `next-themes`, which this app does
  not use
- `input-group.tsx` is hand-written, not CLI-installed: its registry entry declares
  `button`, `input` and `textarea` as dependencies, which would prompt to overwrite existing
  files and add a `Textarea` nothing uses. It otherwise matches upstream.

The primitive system is Radix via the unified `radix-ui` package plus
`class-variance-authority`. Do not mix in another primitive library — that is an
architectural decision, not a component-level one. Icons are Lucide, and icon-only controls
need accessible names.

## Components and functions

Keep modules small and composed; no monoliths. `src/routes/_auth.register/` is the shape to
copy: `route.tsx` holds the flow state and the page frame, while `register-step-one.tsx`,
`register-step-two.tsx` and `register-step-three.tsx` each own one step. A route that
accumulates fetching, filtering, table rendering and pagination in one file needs splitting.

Prefer components under ~300 lines, but responsibility matters more than line count. Split
when a component grows unrelated concerns, not to hit a number. Avoid prop explosions —
compose instead, and use variants for genuine visual variation. Custom hooks must represent
real behaviour; do not wrap standard React APIs.

Comments explain _why_, in a plain human register. No comment that restates the code, no
decorative banners, no emoji, no JSDoc blocks on self-evident functions. If a comment only
tells you what the next line already says, delete it.

Before reaching for `useEffect`, check whether you are synchronising with an external system.
Data fetching is not. Do not add `useMemo`, `useCallback` or `memo` without evidence.

## Testing

- **Vitest + Testing Library** — behaviour, not implementation. Query by role. No snapshots.
- **MSW** (`src/mocks/handlers.ts`) is the one API contract, shared by dev, unit tests and
  Playwright. It validates requests with its own schemas so client/server drift shows up.
- **Playwright** — critical journeys only.

Setup runs MSW with `onUnhandledRequest: "error"`: a request the contract does not cover
should fail the test, not pass silently. Route tests sit next to their route as
`*.test.tsx` and are excluded from the route tree in `src/routes.ts`.

Every async surface defines loading, empty, error and retry deliberately. One shared spinner
for every situation is not acceptable.

## Accessibility and performance

Semantic HTML first, then the shadcn primitive built on it — the primitives wrap Radix, which
handles keyboard and ARIA properly. Keyboard reachable, visible focus, labelled controls,
errors tied to their inputs. Motion runs under
`MotionConfig reducedMotion="user"`, and the stylesheet also neutralises CSS animation under
`prefers-reduced-motion`.

Optimise from evidence. Route-level splitting is already on. Do not add virtualization,
prefetching or memoization speculatively.

## Security

`VITE_*` variables are inlined into the client bundle and are not secrets. All env reads go
through `src/app/config/env.ts`, which validates with Zod and fails fast. Client-side
permission checks are UX only — the backend enforces authorization.

Any redirect built from a URL parameter must go through `safeRedirectTo`
(`src/features/auth/redirect.ts`) before it reaches `navigate()` or `redirect()`. It only
allows a same-origin relative path, which is what stops a crafted `?redirectTo=` value from
sending a signed-in user off-site.

## Commits and hooks

Husky installs on `pnpm install` (the `prepare` script). `pre-commit` runs `lint-staged`
(ESLint --fix then Prettier, staged files only); `commit-msg` runs commitlint against
Conventional Commits (`feat:`, `fix:`, `chore:`, …) via `commitlint.config.js`. Neither hook
runs the type checker — that needs the whole project, not a partial file set, and stays a CI
concern.

`knip` (`pnpm knip`) finds unused files, exports and dependencies. It is not a CI gate: it
runs on demand, and a finding is something to look at, not something to silence with an
export nobody asked for.

## CI

`.github/workflows/ci.yml` runs install (frozen lockfile), lint, `format:check`, typecheck,
test and build in one job; Playwright in a second; commitlint against the PR's commit range in
a third. Node version comes from `.nvmrc`, not a hardcoded number. Do not claim a check passes
without running it.

## Anti-patterns

- `useEffect` + `useState` as a data-fetching layer
- duplicating server data into Context or a client store
- inline query keys, or invalidating everything after a mutation
- fetching the same resource through both a loader and a component
- calling axios from a component
- moving a component into `components/` just because two features use it
- regenerating shadcn components during unrelated work, or accepting a CLI overwrite prompt
- building a styled `div` where a shadcn component already exists
- collecting Tailwind classes into a variable instead of leaving them on the element
- arbitrary Tailwind values where a token exists
- comments that restate the code; comment the _why_ or not at all
- reaching outside a folder with `../../` instead of the `~/` alias
- hand-sorting imports instead of running `pnpm format`
