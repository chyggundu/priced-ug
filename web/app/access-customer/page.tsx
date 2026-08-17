"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/react";
import { getAdminCustomers, lookupCustomer, type Customer } from "@/lib/api";
import { isAdminUser } from "@/lib/admin";
import {
  DashboardShell,
  Notice,
  RequireSignIn,
  ghostButton,
  input,
  label,
  primaryButton,
} from "@/components/dashboard/DashboardShell";
import { whatsappHref } from "@/lib/formatPrice";

/** Mirrors the mobile app's access-customer screen: look a buyer up to deliver. */
export default function AccessCustomerPage() {
  return (
    <RequireSignIn>
      <AccessCustomer />
    </RequireSignIn>
  );
}

function AccessCustomer() {
  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!phone.trim() || !district.trim()) {
      setError("Phone and district are both required.");
      return;
    }
    setError(null);
    setCustomer(null);
    setSearching(true);
    try {
      setCustomer(await lookupCustomer(phone.trim(), district.trim()));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No customer matched those details.");
    } finally {
      setSearching(false);
    }
  };

  const mapsHref =
    customer?.latitude != null && customer.longitude != null
      ? `https://www.google.com/maps/dir/?api=1&destination=${customer.latitude},${customer.longitude}`
      : null;

  const locationText = customer
    ? [
        `${customer.fullName}'s location`,
        [customer.street, customer.village, customer.town, customer.district]
          .filter(Boolean)
          .join(", "),
        mapsHref,
      ]
        .filter(Boolean)
        .join("\n")
    : "";

  return (
    <DashboardShell
      title="Find a customer"
      description="Enter the phone number and district a buyer gave you to see their delivery details."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="phone">
              Phone number *
            </label>
            <input
              id="phone"
              className={input}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +256700000000"
              inputMode="tel"
            />
          </div>
          <div>
            <label className={label} htmlFor="district">
              District *
            </label>
            <input
              id="district"
              className={input}
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            />
          </div>
        </div>

        {error && <Notice>{error}</Notice>}

        <div>
          <button type="submit" className={primaryButton} disabled={searching}>
            {searching ? "Searching…" : "Find customer"}
          </button>
        </div>
      </form>

      <AdminCustomerList />

      {customer && (
        <section className="mt-10 rounded-[10px] border border-line p-5">
          <h2 className="text-lg font-bold tracking-tight">{customer.fullName}</h2>
          <p className="mt-1 text-ink-600">
            {[customer.street, customer.village, customer.town, customer.district]
              .filter(Boolean)
              .join(", ")}
          </p>

          {customer.addressPhotoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={customer.addressPhotoUrl}
              alt="Customer address"
              className="mt-4 w-full max-w-sm rounded-[10px] border border-line object-cover"
            />
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={whatsappHref(customer.phone)}
              target="_blank"
              rel="noreferrer"
              className="rounded-[10px] bg-[#25D366] px-5 py-3 text-[15px] font-semibold text-white transition hover:brightness-95"
            >
              Message on WhatsApp
            </a>
            {mapsHref && (
              <a href={mapsHref} target="_blank" rel="noreferrer" className={ghostButton}>
                Open in Google Maps
              </a>
            )}
            <button
              type="button"
              className={ghostButton}
              onClick={() => void navigator.clipboard.writeText(locationText)}
            >
              Copy location
            </button>
          </div>
        </section>
      )}
    </DashboardShell>
  );
}

/**
 * The full customer directory, which the mobile access-customer screen shows to
 * the admin account only. RLS enforces the same rule server-side, so this is
 * presentation, not protection.
 */
function AdminCustomerList() {
  const { user } = useUser();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = isAdminUser(user);

  useEffect(() => {
    if (!isAdmin) return;
    getAdminCustomers()
      .then(setCustomers)
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Could not load customers."),
      )
      .finally(() => setLoading(false));
  }, [isAdmin]);

  if (!isAdmin) return null;

  return (
    <section className="mt-12">
      <h2 className="text-lg font-bold tracking-tight">
        All customers{" "}
        {!loading && <span className="font-medium text-ink-400">({customers.length})</span>}
      </h2>

      {error && (
        <div className="mt-3">
          <Notice>{error}</Notice>
        </div>
      )}

      {loading ? (
        <div className="mt-4 h-24 animate-pulse rounded-[10px] bg-ink-900/5" />
      ) : customers.length === 0 ? (
        <p className="mt-3 text-ink-600">No delivery profiles saved yet.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {customers.map((entry) => (
            <li
              key={entry.id}
              className="flex flex-wrap items-center gap-3 rounded-[10px] border border-line p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{entry.fullName}</p>
                <p className="truncate text-sm text-ink-400">
                  {[entry.street, entry.village, entry.town, entry.district]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
              <a
                href={whatsappHref(entry.phone)}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 text-sm font-semibold text-[#25D366] transition hover:brightness-90"
              >
                {entry.phone}
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
