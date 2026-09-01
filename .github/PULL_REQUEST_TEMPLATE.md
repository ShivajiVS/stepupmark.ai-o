## What

<!-- One or two sentences: what changed and why. -->

## Target branch

<!--
Feature and fix work targets `staging`, and is squash-merged.
`staging` -> `main` is a release, and is merged with a merge commit — never squashed.
A hotfix straight to `main` needs a follow-up PR back-merging `main` into `staging`.
-->

## Architecture

<!-- lint, format, typecheck, test, build, Playwright and the security scans are
     required status checks. Only the things CI cannot check are listed here. -->

- [ ] Any new UI is composed from shadcn/ui primitives — no hand-styled `div`s standing in for a component the registry already provides
- [ ] No arbitrary Tailwind values (`mt-[17px]`, invented colors) where a token or shadcn variant exists
- [ ] Tailwind classes stay inline on the element, not collected into a variable
- [ ] New TanStack Query keys go through the feature's key factory — no inline keys
- [ ] Mutations invalidate the narrowest key that changed, not `*.all`
- [ ] Cross-feature imports go through a feature's `index.ts`, never a deep import into its internals

## Notes for reviewers

<!-- Anything a reviewer should know: known tradeoffs, follow-ups intentionally deferred, etc. -->
