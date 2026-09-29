/**
 * Phone numbers normalised to the E.164 form Clerk requires.
 *
 * Uganda is the default because that is who the app serves: people here write
 * the same number four different ways — `0772 123456`, `772123456`,
 * `+256772123456`, `256-772-123456` — and Clerk rejects every one of them
 * except the last shape without punctuation.
 *
 * A number typed with a leading `+` (or `00`) is treated as international and
 * kept as-is, so someone abroad — or anyone testing with a foreign SIM — can
 * sign in without the Ugandan rules rejecting their number.
 *
 * The mobile app has its own copy of this file: same rules, separate module,
 * in keeping with the two apps sharing no code.
 */

/** Uganda. Numbers are 9 digits after the country code, and never start with 0. */
const COUNTRY_CODE = "256";
const NATIONAL_LENGTH = 9;

/** E.164 allows at most 15 digits including the country code, and needs a few. */
const E164_MIN_DIGITS = 8;
const E164_MAX_DIGITS = 15;

/** True when the user is entering a full international number themselves. */
export function isInternational(input: string): boolean {
  const trimmed = input.trim();
  return trimmed.startsWith("+") || trimmed.startsWith("00");
}

/**
 * True once the number can be sent to Clerk. Callers use this to enable the
 * Continue button, so it has to agree exactly with `toE164` — anything this
 * accepts, that must be able to convert.
 */
export function isValidPhone(input: string): boolean {
  return toE164(input) !== null;
}

/** Kept as the old name so existing call sites do not have to change. */
export const isValidUgandanPhone = isValidPhone;

/**
 * Returns an E.164 number, or null when the input cannot be read as one. Null
 * rather than a throw: this runs on every keystroke.
 */
export function toE164(input: string): string | null {
  const digits = input.replace(/[^\d]/g, "");
  if (digits.length === 0) return null;

  /*
    An explicit `+` or `00` means the user is giving the country code, so the
    Ugandan prefix and length rules must not be applied to it.
  */
  if (isInternational(input)) {
    const international = digits.startsWith("00") ? digits.slice(2) : digits;
    if (international.length < E164_MIN_DIGITS) return null;
    if (international.length > E164_MAX_DIGITS) return null;
    // A country code never starts with 0.
    if (international.startsWith("0")) return null;
    return `+${international}`;
  }

  let national: string;
  if (digits.startsWith(COUNTRY_CODE)) {
    national = digits.slice(COUNTRY_CODE.length);
  } else if (digits.startsWith("0")) {
    national = digits.slice(1);
  } else {
    national = digits;
  }

  // A trunk `0` survives forms like `2560772123456`, which people do type.
  if (national.startsWith("0")) national = national.slice(1);

  if (national.length !== NATIONAL_LENGTH) return null;
  // Every Ugandan mobile and landline prefix starts 2, 3, 4 or 7. Rejecting the
  // rest catches a mistyped digit before it costs an SMS.
  if (!/^[2347]/.test(national)) return null;

  return `+${COUNTRY_CODE}${national}`;
}

/**
 * `+256772123456` → `+256 772 123 456`, for echoing the number back on the
 * code screen. Falls back to the raw input so the label is never blank.
 */
export function formatForDisplay(input: string): string {
  const e164 = toE164(input);
  if (!e164) return input;

  if (e164.startsWith(`+${COUNTRY_CODE}`)) {
    const national = e164.slice(1 + COUNTRY_CODE.length);
    return `+${COUNTRY_CODE} ${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6)}`;
  }

  // Other countries have their own grouping conventions, so rather than guess
  // wrongly the digits are shown in even blocks after the `+`.
  const digits = e164.slice(1);
  return `+${digits.replace(/(\d{3})(?=\d)/g, "$1 ")}`;
}
