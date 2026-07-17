# Priced Ug — Website

Marketing website for the Priced Ug mobile app. Two pages: the home page and the
privacy policy.

## Standalone by design

This folder is **not** part of the monorepo's pnpm workspace and shares no files
with the mobile app or API server. It has its own `package.json`, its own
`pnpm-lock.yaml`, its own `node_modules` and its own env.

Three things keep it that way — do not remove them:

| File | Why it exists |
| --- | --- |
| `pnpm-workspace.yaml` | Empty `packages: []`. Makes `web/` its own workspace root so pnpm does not adopt the monorepo root above it. |
| `turbopack.root` in `next.config.ts` | Pins the build root to `web/`. Without it Next walks up, finds the monorepo lockfile, and treats the repo root as the project root. |
| `.npmrc` | Local install settings, not inherited from the repo root. |

Run every command from inside `web/`.

## Commands

```bash
pnpm install      # first time
pnpm dev          # http://localhost:3000
pnpm build        # static export into out/
pnpm preview      # serve the built out/ folder
pnpm typecheck
```

## Editing content

**All copy and links live in `content/site.ts`.** The page components read from
it, so you should not need to touch them to change wording, bios, links or
features. The privacy policy text lives in `content/privacy.ts`.

Before launch, fill in the `links` object in `content/site.ts`:

- `appStore` / `playStore` — while empty, the download buttons render as inert
  "Coming soon" chips instead of dead links, so it is safe to ship without them.
- `email` — the support address shown in the footer and privacy policy.
- `whatsapp` — digits only, no `+` (e.g. `256700000000`). Hidden when empty.
- `phone` — hidden when empty.

## Team portraits

Live portraits are in `public/team/`, cropped square around each subject and
saved at 512px / JPEG q88 (~40KB each). They are referenced by the `photo` field
on each member in `content/site.ts`. A member without a `photo` falls back to a
brand-coloured initials tile.

The full-resolution originals the client supplied are kept at `app/assets/ceo.png`
and `app/assets/bdm.png`. They are **not** served — files under `app/` are route
source, not static assets, so anything that needs a URL must live in `public/`.
Keep them as masters if you want to re-crop; otherwise they are safe to delete.

## Deploying

`pnpm build` writes a fully static site to `out/`. Upload that folder to any
static host — Vercel, Netlify, Replit, cPanel, S3, GitHub Pages. No Node server
is required, so `next start` is intentionally not wired up.

Set `NEXT_PUBLIC_SITE_URL` to the real domain before building — it feeds the
canonical URL, sitemap and Open Graph tags.

## After going live

The app currently links to a generated policy at privacypolicies.com. Once this
site is deployed, point the app's privacy link at `https://<your-domain>/privacy`.
That is what the second page is for.

If the source policy is ever regenerated, update `content/privacy.ts` to match.
