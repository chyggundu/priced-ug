---
name: API server testing setup
description: How HTTP route tests for @workspace/api-server are wired (vitest + supertest + pglite)
---
Route tests live in `artifacts/api-server/src/**/*.test.ts`, run via `pnpm --filter @workspace/api-server run test` (vitest). Also registered as the `test` validation command.

Approach:
- Real DB-in-memory using `@electric-sql/pglite` + `drizzle-orm/pglite`. A test-only drizzle instance (`src/test/testDb.ts`) creates tables with raw SQL and exposes `setupSchema()` / `resetDb()`.
- `vi.mock("@workspace/db")` swaps the real Pool-backed `db` for the pglite one while re-exporting the real schema via `await import("@workspace/db/schema")` (that subpath has no Pool, so it's safe to importActual).
- `vi.mock("@clerk/express")` no-ops `clerkMiddleware` and makes `getAuth` read a `vi.hoisted` mutable `authState.userId` so each test controls who is signed in. Admin is `process.env.ADMIN_USER_ID` set in `src/test/setup.ts`.

**Why drizzle-zod + zod are api-server devDeps:** the schema source files import `drizzle-zod` and `zod/v4`; under vitest's node resolution those resolve from the api-server package context (not lib/db's), so without them mocking `@workspace/db` fails with ERR_MODULE_NOT_FOUND. The esbuild prod build bundles lib/db so it never hit this.

**How to apply:** copy this mock pattern for any new api-server route test. `clerkProxyMiddleware` is already a no-op when NODE_ENV !== production (setup sets it to "test"). Keep logs quiet with LOG_LEVEL=silent in setup.
