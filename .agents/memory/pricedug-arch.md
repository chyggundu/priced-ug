---
name: Pricedug architecture
description: Key decisions and gotchas for the Pricedug Expo + Express app.
---

# Pricedug Architecture

## Key decisions

- **One business per user**: enforced at DB level via `UNIQUE(clerkUserId)` on businesses table.
- **Admin via env var**: `ADMIN_USER_ID` env var holds the admin's Clerk userId. Checked in `requireAdmin` middleware and `AuthContext.tsx`.
- **Clerk proxy**: API server mounts Clerk proxy at `/api/__clerk` via `clerkProxyMiddleware`. Expo uses `EXPO_PUBLIC_CLERK_PROXY_URL` (set in production via `build.js`).
- **Generated hooks naming**: Orval generates `export function useGet*` (not `export const useGet*`) for query hooks. All mutation hooks use `export const use*`.
- **Metro watcher ENOENT**: Transient error during pnpm installs — always restart the Expo workflow after installing packages.
- **expo-image-picker**: Must be pinned to `~17.0.11` for Expo SDK 54.

**Why:** One business per user simplifies auth logic (no need for business ownership checks beyond clerkUserId match). Admin via env var avoids a separate admin role system.

**How to apply:** Before adding any business ownership check, use `eq(businessesTable.clerkUserId, req.userId!)`. Admin routes use `requireAdmin` middleware.
