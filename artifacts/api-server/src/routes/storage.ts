import { Router } from "express";
import { Storage } from "@google-cloud/storage";
import { requireAuth } from "../lib/auth";

const router = Router();
const storage = new Storage();
const bucketName = process.env.REPLIT_OBJECT_STORAGE_BUCKET_ID ?? "";

router.post("/storage/upload-url", requireAuth, async (req, res) => {
  try {
    const { filename, contentType } = req.body;
    if (!filename || !contentType) {
      res.status(400).json({ error: "filename and contentType are required" });
      return;
    }

    const key = `uploads/${req.userId}/${Date.now()}-${filename}`;
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(key);

    const [uploadUrl] = await file.generateSignedPostPolicyV4({
      expires: Date.now() + 15 * 60 * 1000,
      conditions: [
        ["content-length-range", 0, 10 * 1024 * 1024],
        ["eq", "$Content-Type", contentType],
      ],
      fields: { "Content-Type": contentType },
    });

    const publicUrl = `https://storage.googleapis.com/${bucketName}/${key}`;
    res.json({ uploadUrl: uploadUrl.url, publicUrl });
  } catch (err) {
    req.log.error({ err }, "Failed to generate upload URL");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
