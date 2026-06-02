import { Router } from "express";
import { requireAuth } from "../lib/auth";
import { ObjectNotFoundError, ObjectStorageService } from "../lib/objectStorage";

const router = Router();
const objectStorage = new ObjectStorageService();

function getPublicBaseUrl(): string {
  const domains = process.env.REPLIT_DOMAINS;
  if (domains) {
    const first = domains.split(",")[0]?.trim();
    if (first) return `https://${first}`;
  }
  const devDomain = process.env.REPLIT_DEV_DOMAIN;
  if (devDomain) return `https://${devDomain}`;
  return "";
}

router.post("/storage/upload-url", requireAuth, async (req, res) => {
  try {
    const { filename, contentType } = req.body ?? {};
    if (!filename || !contentType) {
      res.status(400).json({ error: "filename and contentType are required" });
      return;
    }

    const uploadUrl = await objectStorage.getObjectEntityUploadURL();
    const objectPath = objectStorage.normalizeObjectEntityPath(uploadUrl);
    const publicUrl = `${getPublicBaseUrl()}/api/storage${objectPath}`;

    res.json({ uploadUrl, publicUrl });
  } catch (err) {
    req.log.error({ err }, "Failed to generate upload URL");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get(/^\/storage\/objects\/(.+)$/, async (req, res) => {
  const objectPath = `/objects/${req.params[0]}`;
  try {
    const objectFile = await objectStorage.getObjectEntityFile(objectPath);
    const response = await objectStorage.downloadObject(objectFile);

    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    if (response.body) {
      const reader = response.body.getReader();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    }
    res.end();
  } catch (err) {
    if (err instanceof ObjectNotFoundError) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    req.log.error({ err }, "Failed to serve object");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
