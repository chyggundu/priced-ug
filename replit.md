# Priced Ug

Uganda's local business directory and marketplace. Two independent client apps,
both reading and writing Supabase directly. There is no API server.

## Apps

| | Path | Run |
| --- | --- | --- |
| Mobile (Expo / React Native) | `artifacts/pricedug` | `cd artifacts/pricedug && pnpm exec expo start` |
| Web (Next.js, static export) | `web` | `cd web && pnpm run dev` |

Each owns its `package.json`, lockfile, `node_modules`, `tsconfig.json` and
`.env.local`. Install from inside the app's own directory with
`pnpm install --ignore-workspace`. Nothing is shared between them.

## Data

Supabase Postgres, reached over PostgREST.

- Views: `products_view`, `products_search_view`, `businesses_view`,
  `customers_view`, `reviews_view`
- RPCs: `create_review`, `reply_to_review`, `lookup_customer`,
  `admin_delete_business`
- Storage bucket: `uploads`

Mobile's data layer is `lib/queries.ts` (reads), `lib/mutations.ts` (writes) and
`lib/storage.ts` (uploads). Web's is `lib/api.ts`.

## Auth

Clerk issues the session token; Supabase accepts it as a third-party provider,
so RLS reads the Clerk user id from the JWT `sub` claim via `clerk_uid()`.
Ownership is enforced by row policies, never in the client.

Admin is decided by verified email, matching Supabase's `is_admin()`.
Set `EXPO_PUBLIC_ADMIN_EMAIL` / `NEXT_PUBLIC_ADMIN_EMAIL` to override the
default.

## Environment

Never commit these. Both files are gitignored.

`artifacts/pricedug/.env.local`
```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

`web/.env.local`
```
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
NEXT_PUBLIC_ADMIN_EMAIL=
```

## Known limitation

`products.price` is text, so Postgres cannot sort it numerically. The browse
feed pages 20 at a time newest-first; price sorts fetch up to 500 rows and order
in JS. Paginating price properly needs a numeric column on the view.
