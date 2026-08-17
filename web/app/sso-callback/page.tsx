"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/react";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthUnavailable } from "@/components/auth/AuthUnavailable";
import { isClerkConfigured } from "@/lib/clerk";

/**
 * Where Google returns after OAuth. Clerk finishes the handshake here and then
 * navigates on; the markup below is only what shows during that second.
 */
export default function SSOCallbackPage() {
  if (!isClerkConfigured) return <AuthUnavailable />;

  return (
    <AuthShell
      tagline="Find the best deals in Uganda"
      title="Signing you in…"
      subtitle="One moment while we finish with Google."
    >
      <div className="h-2 w-full overflow-hidden rounded-full bg-ink-900/5">
        <div className="h-full w-1/3 animate-pulse rounded-full bg-brand-500" />
      </div>
      <AuthenticateWithRedirectCallback
        signInFallbackRedirectUrl="/"
        signUpFallbackRedirectUrl="/"
      />
    </AuthShell>
  );
}
