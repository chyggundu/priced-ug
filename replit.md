# Pricedug

A mobile app (iOS + Android via Expo) for Ugandan business owners to create pages with product photos, prices, descriptions, and categories. The public can browse freely; business owners authenticate to manage their own page. The app owner is admin and can hide pages and manage categories.

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
- **Object storage**: Upload-URL endpoint exists in the API (`/api/storage/upload-url`) for image uploads; requires `REPLIT_OBJECT_STORAGE_BUCKET_ID` env var. Skip for MVP if storage isn't provisioned.
- **Public browsing**: The browse screen and business detail pages are fully public — no auth required. Only business management (create/edit) and admin panel require login.

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

- **Set `ADMIN_USER_ID`**: After signing up in the app, find your Clerk user ID (from the Clerk dashboard or by logging `userId` in AuthContext) and set it as the `ADMIN_USER_ID` environment secret. This unlocks the Admin tab.
- **Update WhatsApp number**: The hardcoded `WHATSAPP_NUMBER = "1234567890"` in `(tabs)/index.tsx` and `(tabs)/account.tsx` should be replaced with the actual support WhatsApp number.
- **Always run codegen after changing `openapi.yaml`**: `pnpm --filter @workspace/api-spec run codegen`
- **Drizzle push for schema changes**: `pnpm --filter @workspace/db run push`
- Expo SDK 54 — expo-image-picker pinned to `~17.0.11`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `clerk-auth` skill for Clerk auth setup and Expo integration
