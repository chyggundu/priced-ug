---
name: Pricedug architecture
description: Key decisions and gotchas for the Pricedug Expo + Next.js apps (Supabase-direct, no API server).
---

# Pricedug Architecture

Two independent clients, both straight onto Supabase. No API server, no shared
package, no monorepo workspace. Mobile is `artifacts/pricedug`, web is `web`.

## Key decisions

- **One business per user**: enforced at DB level via `UNIQUE(clerk_user_id)` on
  the businesses table.
- **Admin via verified email**, matching Supabase's `is_admin()`. It used to be
  a Clerk user id in an env var, which never matched: ids differ between Clerk's
  development and production instances, and the mobile variable was unset, so no
  one was ever admin.
- **Clerk as a Supabase third-party provider**: the Clerk session token is passed
  through supabase-js's `accessToken` callback. RLS reads the Clerk id from the
  JWT `sub` claim via `clerk_uid()`. Clerk owns session storage — the Supabase
  client must not persist or refresh a session of its own.
- **Ownership is enforced by RLS only.** A client-side check would be advisory.
- **Reads go through views** (`products_search_view`, `businesses_view`, …) which
  already fold in joins and exclude hidden businesses. Do not hand-join the base
  tables: `products.business_id` has no foreign key, so PostgREST cannot embed.
- **Writes that need server-side rules use RPCs**: `create_review` (stamps the
  author from the JWT, one per user), `reply_to_review`, `lookup_customer`,
  `admin_delete_business`.
- **Uploads** go to the `uploads` bucket via a Supabase signed upload URL, PUT
  with expo-file-system on mobile (React Native cannot stream a `file://` URI
  through fetch). See [[expo-presigned-uploads]].

## Gotchas

- **Never gate the whole tree on auth.** `<ClerkLoaded>` used to wrap the root
  layout, so nothing painted until Clerk finished a network round trip. Browsing
  is public; screens that need auth read `isLoaded`/`isSignedIn` themselves.
- **`EXPO_PUBLIC_*` is inlined at bundle time.** Changing `.env.local` needs
  `expo start --clear`, not a reload.
- **`products.price` is text**, so Postgres cannot sort it numerically. The feed
  pages 20 newest-first; price sorts fetch up to 500 and order in JS.
- The live schema is richer than any Drizzle definition that used to be in this
  repo. Introspect the database, or read `web/lib/api.ts`, before assuming a
  column exists.
