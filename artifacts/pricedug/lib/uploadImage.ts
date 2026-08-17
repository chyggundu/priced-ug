import * as FileSystem from "expo-file-system/legacy";

export async function uploadImageToSignedUrl(
  uploadUrl: string,
  fileUri: string,
  contentType: string,
): Promise<void> {
  const result = await FileSystem.uploadAsync(uploadUrl, fileUri, {
    httpMethod: "PUT",
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    headers: { "Content-Type": contentType },
  });
  if (result.status < 200 || result.status >= 300) {
    throw new Error(`Upload failed with status ${result.status}: ${result.body ?? ""}`.trim());
  }
}

/** Message to show the user when an upload fails, preserving the real cause. */
export function uploadErrorMessage(err: unknown, fallback = "Could not upload image."): string {
  const detail = err instanceof Error ? err.message : String(err ?? "");
  return detail ? `${fallback} ${detail}` : `${fallback} Please try again.`;
}
