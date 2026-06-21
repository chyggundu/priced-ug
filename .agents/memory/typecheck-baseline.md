---
name: typecheck baseline & expo router types
description: Why `pnpm run typecheck` is red at baseline in this repo, and how expo-router typed routes behave
---

# Pre-existing typecheck failures (not yours to fix)

`pnpm run typecheck` is RED at baseline across leaf artifacts, independent of any
single change. Recurring categories that appear in untouched files:

- **react-query `queryKey` strictness**: orval-generated hooks type the `query`
  option as a full `UseQueryOptions` (queryKey required), but every call site
  passes `{ query: { enabled, retry } }` without it → TS2741. Pervasive in
  `artifacts/pricedug` (e.g. my-business.tsx, business/[id].tsx).
- **express `req.params` typing**: `req.params.id` is `string | string[]`, so
  `parseInt(req.params.id)` → TS2345 in api-server routes (businesses, products,
  categories, reviews).
- **Feather icon `"user-circle"`**: not in the installed `@expo/vector-icons`
  Feather union → TS2820 in account.tsx.

**Why:** these come from dependency type versions vs committed generated/handwritten
code, not from feature work.

**How to apply:** When verifying a change, compare against this baseline — new code
should only add the SAME category of "errors" the codebase already tolerates
(match existing `{ query: { enabled } }` convention). Runtime is unaffected: Metro
(Babel) and esbuild strip types, so the apps build/run despite red typecheck.

# expo-router typed routes regenerate at dev time

Adding a screen file under `artifacts/pricedug/app/` does NOT immediately make its
path valid in TS — `app/.expo/types/router.d.ts` is regenerated when the expo dev
server runs. New route paths (e.g. `/customer-profile`) fail typecheck until you
restart the `artifacts/pricedug: expo` workflow, after which they appear in the
union and resolve.
