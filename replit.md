# Priced Ug

A mobile app (iOS + Android via Expo) for Ugandan business owners to create pages with product photos, prices, descriptions, and categories. The public can browse freely; business owners authenticate to manage their own page. The app owner is admin and can hide pages and manage categories.

Repository: https://github.com/chyggundu/priced-ug

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at `/api`)
- `pnpm --filter @workspace/pricedug run dev` — run the Expo mobile app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/scripts run seed-categories` — seed default categories
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` — Clerk auth (provisioned by Replit)
- Optional env: `ADMIN_USER_ID` — Clerk user ID of the admin user (you)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 + Clerk proxy middleware
- DB: PostgreSQL + Drizzle ORM
- Auth: Clerk (Replit-managed)
- Mobile: Expo (SDK 54) + Expo Router + @clerk/expo
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/db/src/schema/` — DB schema (categories, businesses, products)
- `lib/api-spec/openapi.yaml` — source of truth for all API contracts
- `lib/api-client-react/src/generated/` — generated React Query hooks (do not edit manually)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/api-server/src/lib/auth.ts` — `requireAuth`, `requireAdmin`, `optionalAuth` middleware
- `artifacts/pricedug/app/` — Expo Router screens
- `artifacts/pricedug/constants/colors.ts` — red (#E01E37) & white color scheme
- `artifacts/pricedug/context/AuthContext.tsx` — exposes `isAdmin`, `userId`

## Architecture decisions

- **One business per user**: enforced at the API level — a Clerk user can own exactly one business page.
- **Admin via env var**: Admin is identified by `ADMIN_USER_ID` env var matching the Clerk `userId`. Set this to your own Clerk user ID.
- **Clerk proxy**: The API server proxies Clerk auth requests at `/api/__clerk` so the mobile app can authenticate via the same domain.
- **Object storage**: Provisioned via Replit Object Storage (sidecar-authenticated GCS). `POST /api/storage/upload-url` (auth required) returns a signed PUT URL plus a `publicUrl`; the client PUTs the file, then stores `publicUrl`. Objects live in the private bucket and are served publicly through `GET /api/storage/objects/*`. Env vars (set automatically): `DEFAULT_OBJECT_STORAGE_BUCKET_ID`, `PRIVATE_OBJECT_DIR`, `PUBLIC_OBJECT_SEARCH_PATHS`. Storage client lives in `artifacts/api-server/src/lib/objectStorage.ts` + `objectAcl.ts`.
- **Public browsing**: The browse screen and business detail pages are fully public — no auth required. Only business management (create/edit) and admin panel require login.
- **Reviews**: Any signed-in user (except the business owner) can leave one review per business (rating 1–5 + optional comment). The owner can reply once per review; admins can delete any review. Reviewer display name is resolved server-side from Clerk (never trusted from the client), and the public reviews endpoint exposes an `isMine` flag instead of the raw Clerk `userId`. One-review-per-user is enforced by a `unique(businessId, userId)` DB constraint (race-safe: 23505 → 409). Schema in `lib/db/src/schema/reviews.ts`, routes in `artifacts/api-server/src/routes/reviews.ts`, UI in `artifacts/pricedug/components/BusinessReviews.tsx`.

## Product

- **Browse tab**: Grid of businesses, filterable by category, searchable by name. WhatsApp contact button in the header.
- **Business detail**: Full page with banner image, description, address, phone call/WhatsApp buttons, and product grid with "Inquire on WhatsApp" per product.
- **My Business tab**: Owner dashboard — create/edit business info + manage products (add/edit/delete with photos, prices, sizes, materials). Visible only when signed in.
- **Admin panel tab**: Visible only to the admin user — toggle business visibility (hide/show), manage categories. Accessible via `ADMIN_USER_ID` env var.
- **Account tab**: Profile info and sign out. Links to sign-in/sign-up when unauthenticated.

## User preferences

- Red (#E01E37) and white color scheme
- WhatsApp contact button throughout
- Products can have: name, description, price (UGX), photo, size, materials
- Categories are admin-managed

## Gotchas

- **Set BOTH admin vars**: Showing the Admin tab requires two env vars set to the admin's Clerk user ID — `ADMIN_USER_ID` (server-side, enforces admin API permissions) and `EXPO_PUBLIC_ADMIN_USER_ID` (client-side, read by `AuthContext` to render the tab). Set both to the same value. Because `EXPO_PUBLIC_*` vars are inlined by Metro at bundle time, **restart the Expo workflow** after changing it so the app re-bundles. Find the Clerk user ID via the Clerk dashboard or the Clerk backend API (`GET https://api.clerk.com/v1/users`).
- **Update WhatsApp number**: The hardcoded `WHATSAPP_NUMBER = "1234567890"` in `(tabs)/index.tsx` and `(tabs)/account.tsx` should be replaced with the actual support WhatsApp number.
- **Always run codegen after changing `openapi.yaml`**: `pnpm --filter @workspace/api-spec run codegen`
- **Drizzle push for schema changes**: `pnpm --filter @workspace/db run push`
- Expo SDK 54 — expo-image-picker pinned to `~17.0.11`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `clerk-auth` skill for Clerk auth setup and Expo integration
