---
name: Typecheck baseline & expo router types
description: Both apps typecheck clean; how to run each, and when expo-router route types regenerate
---

Both apps are at **zero** TypeScript errors. Treat any error as new.

- Mobile: `cd artifacts/pricedug && npx tsc -p tsconfig.json --noEmit`
- Web: `cd web && npx tsc --noEmit`

There is no root `pnpm run typecheck` any more — the workspace is gone and each
app is typechecked from its own directory.

The old baseline was red with React Query v5 `queryKey` errors and a
`Feather name="user-circle"` that is not a real icon. Both were fixed when the
screens moved to Supabase; `user-circle` had been silently rendering nothing.

expo-router route types under `.expo/types/` regenerate only when the Expo dev
server runs, so a fresh clone can report missing route types until
`expo start` has been run once.
