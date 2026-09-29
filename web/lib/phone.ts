/**
 * Ugandan phone numbers, normalised to the E.164 form Clerk requires.
 *
 * People here write the same number four different ways — `0772 123456`,
 * `772123456`, `+256772123456`, `256-772-123456` — and Clerk rejects every one
 * of them except the last shape without punctuation. Normalising in the client
 * means the user never sees `form_param_format_invalid` for a number they typed
 * correctly by local convention.
 *
 * The mobile app has its own copy of this file: same rules, separate module,
 * in keeping with the two apps sharing no code.
 */

/** Uganda. Numbers are 9 digits after the country code, and never start with 0. */
const COUNTRY_CODE = "256";
const NATIONAL_LENGTH = 9;

/**
 * True once the number can be sent to Clerk. Callers use this to enable the
 * Continue button, so it has to agree exactly with `toE164` — anything this
 * accepts, that must be able to convert.
 */
export function isValidUgandanPhone(input: string): boolean {
  return toE164(input) !== null;
}

/**
 * Returns `+256XXXXXXXXX`, or null when the input cannot be read as a Ugandan
 * number. Null rather than a throw: this runs on every keystroke.
 */
export function toE164(input: string): string | null {
  // Strip everything the user might use as a separator, keeping a leading `+`
  // only so the `00` and `+` prefixes can be told apart below.
  const digits = input.replace(/[^\d]/g, "");
  if (digits.length === 0) return null;

  let national: string;
  if (digits.startsWith("00" + COUNTRY_CODE)) {
    national = digits.slice(2 + COUNTRY_CODE.length);
  } else if (digits.startsWith(COUNTRY_CODE)) {
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
  const national = e164.slice(1 + COUNTRY_CODE.length);
  return `+${COUNTRY_CODE} ${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6)}`;
}
