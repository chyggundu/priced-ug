import { randomUUID } from "crypto";
import express, { Router, type Request } from "express";
import { pool } from "@workspace/db";
import { requireAuth } from "../lib/auth";

const router = Router();

// Absolute base URL the client can reach this server at, used to build the
// stored image URLs. Prefers an explicit override, then Replit's domains, then
// falls back to the incoming request's host (works for localhost and any host).
function getPublicBaseUrl(req: Request): string {
  if (process.env.PUBLIC_BASE_URL) return process.env.PUBLIC_BASE_URL.trim();
  const domains = process.env.REPLIT_DOMAINS;
  if (domains) {
    const first = domains.split(",")[0]?.trim();
    if (first) return `https://${first}`;
  }
  const devDomain = process.env.REPLIT_DEV_DOMAIN;
  if (devDomain) return `https://${devDomain}`;
  const host = req.get("host");
  return host ? `${req.protocol}://${host}` : "";
}

// Issue an upload target. The image bytes are stored directly in Postgres
// (objects table) — no external storage bucket required.
router.post("/storage/upload-url", requireAuth, async (req, res) => {
  try {
    const { filename, contentType } = req.body ?? {};
    if (!filename || !contentType) {
      res.status(400).json({ error: "filename and contentType are required" });
      return;
    }

    const objectId = randomUUID();
    const base = getPublicBaseUrl(req);
    res.json({
      uploadUrl: `${base}/api/storage/upload/${objectId}`,
      publicUrl: `${base}/api/storage/objects/uploads/${objectId}`,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to generate upload URL");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Receive the raw image bytes and store them in Postgres. Unauthenticated by
// design — the object id is an unguessable UUID issued by the authenticated
// /storage/upload-url call above, mirroring the signed-URL upload model (the
// client PUT carries no auth header).
router.put(
  "/storage/upload/:id",
  express.raw({ type: "*/*", limit: "25mb" }),
  async (req, res) => {
    try {
      const id = req.params.id;
      const contentType = req.get("content-type") || "application/octet-stream";
      const bytes = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
      if (bytes.length === 0) {
        res.status(400).json({ error: "Empty request body" });
        return;
      }
      await pool.query(
        `insert into objects (id, content_type, bytes)
         values ($1, $2, $3)
         on conflict (id) do update
           set content_type = excluded.content_type, bytes = excluded.bytes`,
        [id, contentType, bytes],
      );
      res.status(200).json({ ok: true });
    } catch (err) {
      req.log.error({ err }, "Failed to store uploaded object");
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// Serve stored image bytes. Public URLs look like /api/storage/objects/uploads/<id>.
router.get(/^\/storage\/objects\/(.+)$/, async (req, res) => {
  try {
    const relPath = req.params[0] as string;
    const id = relPath.split("/").pop() as string;
    const result = await pool.query<{ content_type: string; bytes: Buffer }>(
      `select content_type, bytes from objects where id = $1`,
      [id],
    );
    if (result.rowCount === 0) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    const row = result.rows[0];
    res.setHeader("Content-Type", row.content_type || "application/octet-stream");
    res.setHeader("Content-Length", String(row.bytes.length));
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.status(200).send(row.bytes);
  } catch (err) {
    req.log.error({ err }, "Failed to serve object");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
