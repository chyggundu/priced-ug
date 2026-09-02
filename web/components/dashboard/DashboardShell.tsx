"use client";

import Link from "next/link";
import { useAuth } from "@clerk/react";
import { Nav } from "@/components/Nav";
import { ConsentGate } from "@/components/ConsentGate";
import { isClerkConfigured } from "@/lib/clerk";
import { isSupabaseConfigured } from "@/lib/supabase";

/** Field and control styling shared by every dashboard form. */
export const label = "block text-sm font-semibold text-ink-900";
export const input =
  "mt-1.5 w-full rounded-[10px] border border-line bg-white px-4 py-3 text-[15px] text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";
export const primaryButton =
  "rounded-[10px] bg-brand-500 px-5 py-3 text-[15px] font-semibold text-white transition duration-300 hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50";
export const ghostButton =
  "rounded-[10px] border border-line px-5 py-3 text-[15px] font-semibold text-ink-600 transition duration-300 hover:border-brand-500 hover:text-brand-500";

export function Notice({ tone = "error", children }: { tone?: "error" | "info"; children: React.ReactNode }) {
  const styles =
    tone === "error" ? "bg-brand-100 text-brand-600" : "bg-ink-900/5 text-ink-600";
  return <p className={`rounded-[10px] px-4 py-3 text-sm ${styles}`}>{children}</p>;
}

/**
 * Page chrome for the signed-in area: site nav on top, and a single place where
 * "you must be signed in" and "this build has no backend configured" are handled,
 * so each screen below can assume it has both.
 */
export function DashboardShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav />
      <main className="mx-auto w-full max-w-3xl px-5 py-10">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 text-ink-600">{description}</p>}
        <div className="mt-8">{children}</div>
      </main>
    </>
  );
}

export function RequireSignIn({ children }: { children: React.ReactNode }) {
  if (!isClerkConfigured || !isSupabaseConfigured) {
    return (
      <DashboardShell title="Not available in this build">
        <Notice>
          This page needs both Clerk and Supabase keys in{" "}
          <code className="font-mono">web/.env.local</code>. Add the Clerk{" "}
          <strong>development</strong> key (<code className="font-mono">pk_test_…</code>) for local
          work — a production key only works on the live domain.
        </Notice>
      </DashboardShell>
    );
  }
  return <RequireSignInLive>{children}</RequireSignInLive>;
}

function RequireSignInLive({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <DashboardShell title="Loading…">
        <div className="h-32 animate-pulse rounded-[10px] bg-ink-900/5" />
      </DashboardShell>
    );
  }

  if (!isSignedIn) {
    return (
      <DashboardShell
        title="Sign in to continue"
        description="Your business page and items live with your account."
      >
        <div className="flex gap-3">
          <Link href="/sign-in" className={primaryButton}>
            Login
          </Link>
          <Link href="/sign-up" className={ghostButton}>
            Sign up
          </Link>
        </div>
      </DashboardShell>
    );
  }

  // The app requires the agreement before any signed-in use; so does this.
  return <ConsentGate>{children}</ConsentGate>;
}
