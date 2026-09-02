"use client";

import Link from "next/link";
import { useAuth, useClerk, useUser } from "@clerk/react";
import { isClerkConfigured } from "@/lib/clerk";

/**
 * Header auth controls, matching the mobile app: signed out shows Login and Sign
 * up, signed in swaps them for the account entry point and a way out.
 *
 * Clerk loads asynchronously and this is a static page, so `isLoaded` is false on
 * first paint. Rendering the signed-out pair during that window would make the
 * buttons flip for anyone already signed in, so the slot stays empty (but
 * reserves its height) until Clerk knows the answer.
 */
export function AuthButtons() {
  // No Clerk key in this build: still offer the buttons (the pages explain the
  // situation) rather than calling hooks that would throw without a provider.
  if (!isClerkConfigured) return <SignedOutButtons />;
  return <AuthButtonsLive />;
}

function AuthButtonsLive() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();

  if (!isLoaded) return <div className="h-9 w-[8.5rem]" aria-hidden />;

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/my-business"
          className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-ink-600 transition duration-300 hover:text-brand-500 sm:block"
        >
          My business
        </Link>
        <Link
          href="/account"
          title={user?.primaryEmailAddress?.emailAddress ?? undefined}
          className="rounded-lg px-3 py-2 text-sm font-semibold text-ink-600 transition duration-300 hover:text-brand-500"
        >
          Account
        </Link>
        <button
          type="button"
          onClick={() => signOut({ redirectUrl: "/" })}
          className="rounded-lg border border-line px-3.5 py-2 text-sm font-semibold text-ink-600 transition duration-300 hover:border-brand-500 hover:text-brand-500"
        >
          Sign out
        </button>
      </div>
    );
  }

  return <SignedOutButtons />;
}

function SignedOutButtons() {
  return (
    <div className="flex items-center gap-2">
      <Link
        href="/sign-in"
        className="rounded-lg px-3 py-2 text-sm font-semibold text-ink-600 transition duration-300 hover:text-brand-500"
      >
        Login
      </Link>
      <Link
        href="/sign-up"
        className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-brand-500/30 transition duration-300 hover:-translate-y-0.5 hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-500/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
      >
        Sign up
      </Link>
    </div>
  );
}
