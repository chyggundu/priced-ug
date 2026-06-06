---
name: Expo presigned image uploads
description: Reliable way to upload picked images to a presigned PUT URL in Expo/React Native
---

In React Native / Expo, uploading a local `file://` image to a presigned PUT URL via
`fetch(uri).then(r => r.blob())` then `fetch(putUrl, { method: "PUT", body: blob })`
is unreliable — it frequently uploads a 0-byte/corrupt body, so the stored object is
empty and the image never renders even though the backend storage is fine.

**Rule:** stream the file from disk instead, using `expo-file-system`'s `uploadAsync`
with `BINARY_CONTENT`.

**Why:** RN's fetch does not reliably serialize a Blob read from a `file://` URI as a
raw request body. `uploadAsync` reads the file directly off disk and PUTs the bytes.

**How to apply (Expo SDK 54, expo-file-system v19):** `uploadAsync` /
`FileSystemUploadType` moved to the legacy entrypoint — import from
`expo-file-system/legacy`, not `expo-file-system`. Pattern:
`FileSystem.uploadAsync(url, fileUri, { httpMethod: "PUT", uploadType:
FileSystem.FileSystemUploadType.BINARY_CONTENT, headers: { "Content-Type": ct } })`
and check `result.status` is 2xx.
