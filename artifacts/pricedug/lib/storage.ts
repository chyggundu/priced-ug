import * as Crypto from "expo-crypto";
import * as FileSystem from "expo-file-system/legacy";

import { supabase, supabaseUrl } from "@/lib/supabase";

/** Same bucket the website uploads to, so both clients share one media store. */
export const BUCKET = "uploads";

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

/**
 * Uploads a picked image straight to Supabase Storage and returns its public
 * URL.
 *
 * The old flow asked the API server for a signed URL; Supabase issues one
 * itself. The PUT still goes through expo-file-system rather than fetch()
 * because React Native cannot stream a file:// URI into a request body — it
 * would have to read the whole image into JS memory first.
 */
export async function uploadImage(fileUri: string, contentType: string): Promise<string> {
  const info = await FileSystem.getInfoAsync(fileUri);
  if (info.exists && typeof info.size === "number" && info.size > MAX_UPLOAD_BYTES) {
    throw new Error(
      `That file is ${(info.size / 1024 / 1024).toFixed(1)} MB. The limit is 50 MB — please choose a smaller one.`,
    );
  }

  const ext =
    (fileUri.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${Crypto.randomUUID()}.${ext}`;

  const { data: signed, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUploadUrl(path);
  if (error) throw error;

  const uploadUrl =
    `${supabaseUrl.replace(/\/+$/, "")}/storage/v1/object/upload/sign/` +
    `${BUCKET}/${path}?token=${signed.token}`;

  const result = await FileSystem.uploadAsync(uploadUrl, fileUri, {
    httpMethod: "PUT",
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    headers: { "Content-Type": contentType },
  });
  if (result.status < 200 || result.status >= 300) {
    throw new Error(`Upload failed with status ${result.status}`);
  }

  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
