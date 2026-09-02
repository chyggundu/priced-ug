"use client";

import Link from "next/link";
import { Nav } from "@/components/Nav";
import { useEffect, useState } from "react";
import {
  LEGAL_ACCEPTED_STORAGE_KEY,
  LEGAL_AGREEMENT_TITLE,
  LEGAL_AGREEMENT_VERSION,
} from "@/content/legal";

/**
 * The app's launch-time consent gate, adapted for the web.
 *
 * The mobile version blocks the entire app until the agreement is accepted. On a
 * public website that would put a modal in front of every marketing visitor, so
 * this gates the signed-in area instead: browsing and the landing pages stay
 * open, and acceptance is required before using an account. Same storage key and
 * version as the app, so the record means the same thing in both places.
 */
export function ConsentGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"loading" | "needed" | "accepted">("loading");
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      const accepted = window.localStorage.getItem(LEGAL_ACCEPTED_STORAGE_KEY);
      setStatus(accepted === LEGAL_AGREEMENT_VERSION ? "accepted" : "needed");
    } catch {
      // Storage blocked (private mode, strict settings) — ask again rather than
      // locking the user out of their own account.
      setStatus("needed");
    }
  }, []);

  const accept = () => {
    try {
      window.localStorage.setItem(LEGAL_ACCEPTED_STORAGE_KEY, LEGAL_AGREEMENT_VERSION);
    } catch {
      // Not persisting is survivable; the gate simply asks again next visit.
    }
    setStatus("accepted");
  };

  if (status === "loading") {
    return (
      <>
        <Nav />
        <main className="mx-auto w-full max-w-3xl px-5 py-10">
          <div className="h-40 animate-pulse rounded-[10px] bg-ink-900/5" />
        </main>
      </>
    );
  }

  if (status === "needed") {
    return (
      <>
        <Nav />
        <main className="mx-auto w-full max-w-3xl px-5 py-10">
      <div className="rounded-[10px] border border-line p-5">
        <h2 className="text-lg font-bold tracking-tight">{LEGAL_AGREEMENT_TITLE}</h2>
        <p className="mt-2 text-ink-600">
          Before using your account, please read and accept the agreement. It covers the liability
          waiver, binding arbitration, and class action waiver.
        </p>

        <Link
          href="/legal"
          className="mt-3 inline-block text-sm font-medium text-brand-500 transition hover:text-brand-600"
        >
          Read the full agreement →
        </Link>

        <label className="mt-5 flex items-start gap-2.5 text-[15px] text-ink-600">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-0.5 size-4 accent-brand-500"
          />
          I have read and agree to be legally bound by the User Agreement, Liability Waiver and
          Dispute Resolution terms.
        </label>

        <button
          type="button"
          onClick={accept}
          disabled={!checked}
          className="mt-5 rounded-[10px] bg-brand-500 px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Agree and continue
        </button>
      </div>
        </main>
      </>
    );
  }

  return <>{children}</>;
}
