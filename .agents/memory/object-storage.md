---
name: Object storage (Replit) for Pricedug
description: How image uploads/serving work and why; non-obvious Replit Object Storage gotchas.
---

# Object storage

Image uploads use Replit Object Storage via the sidecar-authenticated GCS client
(canonical `objectStorage.ts` + `objectAcl.ts` templates copied into
`artifacts/api-server/src/lib/`). Flow: `POST /api/storage/upload-url` (requireAuth)
returns a signed PUT URL + an absolute `publicUrl`; client PUTs the file, stores
`publicUrl`. `publicUrl` points at `GET /api/storage/objects/*`, which streams the
object back through the API.

**Why serve through the API:** Replit buckets are PRIVATE. Public GCS URLs
(`storage.googleapis.com/...`) are NOT publicly readable, so images must be served
through our own endpoint. The serving route intentionally does NO ACL check —
this is a public business directory, all images are meant to be public.

**Gotchas:**
- Plain `new Storage()` does NOT authenticate against Replit buckets. Must use the
  sidecar credential config (token_url/credential at `http://127.0.0.1:1106`).
- Env vars are `DEFAULT_OBJECT_STORAGE_BUCKET_ID`, `PRIVATE_OBJECT_DIR`,
  `PUBLIC_OBJECT_SEARCH_PATHS` (NOT the old `REPLIT_OBJECT_STORAGE_BUCKET_ID`).
- The template `normalizeObjectEntityPath` appends a trailing slash to
  `PRIVATE_OBJECT_DIR` before slicing, so it returns `/objects/uploads/<id>` (no
  double slash); `getObjectEntityFile` reverses it consistently. Don't "fix" it.
- The mobile contract `{ uploadUrl, publicUrl }` is unchanged, so storage changes
  need no OpenAPI/codegen/mobile edits.
- Express 5 (path-to-regexp v8): bare `*` route is invalid. The serving route uses
  a RegExp (`/^\/storage\/objects\/(.+)$/`) and reads `req.params[0]`.

**Known gap (not implemented):** no server-side file size / MIME enforcement on the
signed PUT flow. Adding it requires a finalize/commit endpoint or post-upload
verify — a contract change. Revisit if abuse/cost becomes a concern.
