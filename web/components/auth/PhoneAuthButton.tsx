import Link from "next/link";

/**
 * "Use phone number", sitting alongside GoogleAuthButton on the email screens.
 *
 * It only navigates — the whole SMS flow lives on /phone, because the code step
 * needs a page of its own. Styled as a secondary button so the email form stays
 * the primary path for existing accounts.
 */
export function PhoneAuthButton({ mode = "sign-in" }: { mode?: "sign-in" | "sign-up" }) {
  return (
    <Link
      href="/phone"
      aria-label={mode === "sign-up" ? "Sign up with phone number" : "Sign in with phone number"}
      className="mt-3 flex w-full items-center justify-center gap-2.5 rounded-[10px] border border-line bg-white px-4 py-3 text-[15px] font-semibold text-ink-900 transition hover:border-ink-400"
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="size-[18px]"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <path d="M12 18h.01" />
      </svg>
      Use phone number
    </Link>
  );
}
