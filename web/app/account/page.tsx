"use client";

import Link from "next/link";
import { useClerk, useUser } from "@clerk/react";
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

      <div className="mt-8">
        <button type="button" className={ghostButton} onClick={() => signOut({ redirectUrl: "/" })}>
          Sign out
        </button>
      </div>
    </DashboardShell>
  );
}
