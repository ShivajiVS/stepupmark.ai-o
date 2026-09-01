## What

<!-- One or two sentences: what changed and why. -->

## Checklist

- [ ] `pnpm lint` passes
- [ ] `pnpm format:check` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm test:run` passes
- [ ] `pnpm build` passes
- [ ] `pnpm exec playwright test` passes (if this touches a routed page or user-facing flow)

## Architecture

- [ ] Any new UI is composed from shadcn/ui primitives — no hand-styled `div`s standing in for a component the registry already provides
- [ ] No arbitrary Tailwind values (`mt-[17px]`, invented colors) where a token or shadcn variant exists
- [ ] Tailwind classes stay inline on the element, not collected into a variable
- [ ] New TanStack Query keys go through the feature's key factory — no inline keys
- [ ] Mutations invalidate the narrowest key that changed, not `*.all`
- [ ] Cross-feature imports go through a feature's `index.ts`, never a deep import into its internals

## Notes for reviewers

<!-- Anything a reviewer should know: known tradeoffs, follow-ups intentionally deferred, etc. -->
