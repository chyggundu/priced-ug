const E164_REGEX = /^\+[1-9]\d{6,14}$/;

export function normalizePhone(input: string): string | null {
  const cleaned = input.replace(/[\s\-().]/g, "");
  if (!E164_REGEX.test(cleaned)) return null;
  return cleaned;
}

export const PHONE_ERROR_MESSAGE =
  "Phone number must start with a country code, e.g. +256 700 000 000";
