"use client";

import { useState } from "react";
import { useClerk } from "@clerk/react";

/**
 * "Continue with Google", mirroring the mobile app's button.
 *
 * The web flow is a plain browser redirect — no in-app browser, no session
 * handoff — so it uses Clerk's classic `authenticateWithRedirect` on the client
 * resource. Google returns to /sso-callback, which finishes the handshake and
 * sends the user home.
 */
export function GoogleAuthButton({ mode = "sign-in" }: { mode?: "sign-in" | "sign-up" }) {
  const clerk = useClerk();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onClick = async () => {
    setBusy(true);
    setError(null);
    try {
      const resource = mode === "sign-up" ? clerk.client.signUp : clerk.client.signIn;
      await resource.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback/",
        redirectUrlComplete: "/",
      });
      // On success the browser navigates away, so nothing after this runs.
    } catch (e) {
      const detail =
        (e as { errors?: { longMessage?: string; message?: string }[] })?.errors?.[0]
          ?.longMessage ??
        (e as Error)?.message ??
        "Please try again.";
      setError(detail);
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <span className="text-sm text-ink-400">or</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className="flex w-full items-center justify-center gap-2.5 rounded-[10px] border border-line bg-white px-4 py-3 text-[15px] font-semibold text-ink-900 transition hover:border-ink-400 disabled:opacity-50"
      >
        <span aria-hidden className="text-lg font-bold text-[#4285F4]">
          G
        </span>
        {busy ? "Opening Google…" : "Continue with Google"}
      </button>

      {error && <p className="mt-2 text-sm text-brand-600">{error}</p>}
    </div>
  );
}
