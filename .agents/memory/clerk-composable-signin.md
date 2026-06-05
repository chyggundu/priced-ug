---
name: Clerk composable useSignIn API (future/composable)
description: Method names and flow for Clerk's composable signIn hook used in the Expo app (password sign-in, password reset).
---

# Clerk composable `useSignIn()` API

The Expo app (`@clerk/expo` ^3.3.0 → `@clerk/react` 6.7.2) uses Clerk's **composable/future** hook API, NOT the legacy `signIn.create({...}).then(...)` resource API. The hook returns `{ signIn, errors, fetchStatus }`.

**Why:** the method names are not discoverable by grepping the minified bundle. They are only in the `.d.ts` of `@clerk/shared` — search `node_modules/.pnpm/@clerk+shared@*/.../@clerk/shared/dist/types/index.d.ts` for `interface SignInFutureResource` and `resetPasswordEmailCode`.

## Shapes
- `fetchStatus`: `'idle' | 'fetching'` — use for button busy/disable.
- `errors`: `{ fields: { identifier|password|code: FieldError|null }, global: ClerkGlobalHookError[]|null, raw }`. `FieldError.message` is safe. `global[0]` is opaque — cast `as { message?: string }` to read `.message`.
- Every method returns `Promise<{ error: ClerkError | null }>`. Check `.error` before advancing.
- `signIn.status` drives state: `'needs_new_password'`, `'complete'`, `'needs_client_trust'`, etc.

## Password sign-in
`signIn.password({ emailAddress | identifier, password })` → if `status === 'complete'` call `signIn.finalize({ navigate })`.

## Password reset flow
1. `signIn.create({ identifier: email })` — establishes the account.
2. `signIn.resetPasswordEmailCode.sendCode()` — no args; sends to first email on the account.
3. `signIn.resetPasswordEmailCode.verifyCode({ code })` — on success `status` becomes `'needs_new_password'`.
4. `signIn.resetPasswordEmailCode.submitPassword({ password })` — on success `status` becomes `'complete'`.
5. `signIn.finalize({ navigate: ({ decorateUrl }) => { ... router.replace('/(tabs)') } })`.

`resetPasswordPhoneCode` exists with the same shape (sendCode takes optional phone params).

## How to apply
When adding/modifying auth screens in `artifacts/pricedug/app/(auth)/`, mirror this flow and the existing `sign-in.tsx` error-rendering pattern (`errors.fields.*.message` inline). Do not reach for the legacy promise-chaining resource API.
