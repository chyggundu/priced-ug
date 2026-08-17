"use client";

import { ClerkProvider } from "@clerk/react";
import { SupabaseAuthBridge } from "@/components/SupabaseAuthBridge";
import { clerkPublishableKey, isClerkConfigured } from "@/lib/clerk";

/**
 * Clerk runs entirely in the browser here: the site is a static export, so there
 * is no server to hold a session. The publishable key is browser-safe by design,
 * and it points at the same Clerk instance the mobile app uses — one account
 * works in both places.
 *
 * This is the website's own auth wiring. It deliberately shares nothing with
 * artifacts/pricedug: same instance, separate code, separate env.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  // Without a key Clerk throws on mount and takes the whole page with it. The
  // marketing pages must stay readable regardless, so render them unwrapped and
  // let the auth pages report the misconfiguration themselves.
  if (!isClerkConfigured) return <>{children}</>;

  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <SupabaseAuthBridge />
      {children}
    </ClerkProvider>
  );
}
