# Architecture

Two independent apps, both talking straight to Supabase. There is no API
server, no shared package, and no monorepo workspace.

| | Mobile | Web |
| --- | --- | --- |
| Path | `artifacts/pricedug` | `web` |
| Stack | Expo / React Native | Next.js (static export) |
| Data | `lib/queries.ts`, `lib/mutations.ts` | `lib/api.ts` |
| Storage | `lib/storage.ts` | `lib/api.ts` |
| Auth | Clerk → Supabase third-party auth | same |
| Config | `.env.local`, own `package.json`, own `node_modules` | same |

Each installs and runs from inside its own directory. Nothing is shared between
them by design: they hit the same Postgres views and the same `uploads` bucket,
but every line of client code is separate.

## How auth reaches the database

Clerk issues the session token. Supabase accepts it as a third-party provider,
so RLS reads the Clerk user id from the JWT's `sub` claim (`clerk_uid()`).
Nothing re-checks ownership in the client — a client-side check would be
advisory only.

Admin is decided by **verified email**, matching Supabase's `is_admin()`. It
used to compare a Clerk user id on mobile, which never matched: ids differ
between Clerk instances, and the variable was unset, so no one was ever admin.

## Database objects both apps rely on

Views: `products_view`, `products_search_view`, `businesses_view`,
`customers_view`, `reviews_view`.
RPCs: `create_review`, `reply_to_review`, `lookup_customer`,
`admin_delete_business`.
Bucket: `uploads`.

## Removed

`artifacts/api-server`, `lib/api-client-react`, `lib/api-spec`, `lib/api-zod`,
`lib/db`, `scripts/`, `pnpm-workspace.yaml`, root `tsconfig*.json`, root `.env`.
All are recoverable from git history if something turns out to be needed.

## Known limitation

`products.price` is text, so Postgres cannot order it numerically. Newest-first
pages 20 at a time; price sorts fetch up to 500 rows and order in JS. Paginating
price properly needs a numeric column on the view.
