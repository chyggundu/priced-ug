/*
  PostgREST rejections arrive as plain `{ message, code, hint }` objects rather
  than Error instances, so reading `.message` off the value is what actually
  surfaces the reason.
*/
export function describeError(error: unknown): string {
  const message =
    typeof error === "object" && error !== null && "message" in error
      ? String((error as { message: unknown }).message ?? "")
      : String(error ?? "");
  return message.trim() || "Please try again.";
}
