"use client";

import Link from "next/link";
import { useState } from "react";
import { useClerk, useUser } from "@clerk/react";
import { deleteMyAccountData } from "@/lib/api";
import { Notice } from "@/components/dashboard/DashboardShell";
import { isAdminUser } from "@/lib/admin";
import { DashboardShell, RequireSignIn, ghostButton } from "@/components/dashboard/DashboardShell";
import { links } from "@/content/site";
import { whatsappHref } from "@/lib/formatPrice";

const ROWS = [
  { href: "/my-business", label: "My business", hint: "Your business page and items" },
  { href: "/favorites", label: "Favourites", hint: "Saved businesses and items" },
  { href: "/customer-profile", label: "Delivery profile", hint: "Where businesses deliver to you" },
  { href: "/access-customer", label: "Find a customer", hint: "Look up a buyer's delivery details" },
  { href: "/nearby", label: "Nearby", hint: "Businesses closest to you" },
  { href: "/browse", label: "Browse", hint: "Find businesses and items" },
  { href: "/legal", label: "User agreement", hint: "Terms, liability and disputes" },
  { href: "/privacy", label: "Privacy policy", hint: "How your data is handled" },
];

/** Mirrors the mobile app's Account tab. */
export default function AccountPage() {
  return (
    <RequireSignIn>
      <Account />
    </RequireSignIn>
  );
}

function Account() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Same two-step order as the mobile app: clear the Supabase rows while the
  // Clerk token is still valid, then delete the Clerk account, which ends the
  // session. Reversing these would strand the data with no way back in.
  const handleDelete = async () => {
    if (
      !window.confirm(
        "This permanently deletes your account and all your data — your business page, products, reviews, and saved profile. This cannot be undone.",
      )
    ) {
      return;
    }
    setDeleteError(null);
    setDeleting(true);
    try {
      await deleteMyAccountData();
      await user?.delete();
    } catch (e) {
      setDeleteError(
        e instanceof Error ? e.message : "Please try again or contact support.",
      );
      setDeleting(false);
    }
  };

  return (
    <DashboardShell
      title="Account"
      description={user?.primaryEmailAddress?.emailAddress ?? undefined}
    >
      <ul className="divide-y divide-line rounded-[10px] border border-line">
        {ROWS.map((row) => (
          <li key={row.href}>
            <Link href={row.href} className="block px-4 py-4 transition hover:bg-brand-50">
              <span className="font-semibold">{row.label}</span>
              <span className="mt-0.5 block text-sm text-ink-400">{row.hint}</span>
            </Link>
          </li>
        ))}

        {isAdminUser(user) && (
          <li>
            <Link href="/admin" className="block px-4 py-4 transition hover:bg-brand-50">
              <span className="font-semibold">Admin panel</span>
              <span className="mt-0.5 block text-sm text-ink-400">Categories and businesses</span>
            </Link>
          </li>
        )}

        {/* Support goes to WhatsApp, same number the app uses. */}
        {links.whatsapp && (
          <li>
            <a
              href={whatsappHref(links.whatsapp, "Hi, I need help with Priced Ug.")}
              target="_blank"
              rel="noreferrer"
              className="block px-4 py-4 transition hover:bg-brand-50"
            >
              <span className="font-semibold text-[#25D366]">Contact support on WhatsApp</span>
              <span className="mt-0.5 block text-sm text-ink-400">We usually reply quickly</span>
            </a>
          </li>
        )}
      </ul>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button type="button" className={ghostButton} onClick={() => signOut({ redirectUrl: "/" })}>
          Sign out
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-[10px] px-5 py-3 text-[15px] font-semibold text-brand-600 transition hover:bg-brand-100 disabled:opacity-50"
        >
          {deleting ? "Deleting…" : "Delete account"}
        </button>
      </div>

      {deleteError && (
        <div className="mt-4">
          <Notice>{deleteError}</Notice>
        </div>
      )}
    </DashboardShell>
  );
}
