"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useUser } from "@clerk/react";
import {
  adminDeleteBusiness,
  createCategory,
  deleteCategory,
  getAdminBusinesses,
  getCategories,
  setBusinessVisibility,
  type Business,
  type Category,
} from "@/lib/api";
import {
  DashboardShell,
  Notice,
  RequireSignIn,
  ghostButton,
  input,
  label,
  primaryButton,
} from "@/components/dashboard/DashboardShell";
import { isAdminUser } from "@/lib/admin";

/** Mirrors the mobile app's admin panel: categories, and business visibility. */
export default function AdminPage() {
  return (
    <RequireSignIn>
      <AdminGate />
    </RequireSignIn>
  );
}

function AdminGate() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <DashboardShell title="Admin">
        <div className="h-32 animate-pulse rounded-[10px] bg-ink-900/5" />
      </DashboardShell>
    );
  }

  // Admin is decided by verified email here and again by RLS in Postgres, so a
  // spoofed client cannot actually write anything.
  if (!isAdminUser(user)) {
    return (
      <DashboardShell title="Admin">
        <Notice>This area is for the Priced Ug admin account only.</Notice>
      </DashboardShell>
    );
  }

  return <AdminPanel />;
}

function AdminPanel() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [b, c] = await Promise.all([getAdminBusinesses(), getCategories()]);
      setBusinesses(b);
      setCategories(c);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load admin data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const run = async (action: () => Promise<unknown>) => {
    setError(null);
    try {
      await action();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "That action failed.");
    }
  };

  if (loading) {
    return (
      <DashboardShell title="Admin">
        <div className="h-40 animate-pulse rounded-[10px] bg-ink-900/5" />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title="Admin" description="Categories and business visibility.">
      {error && <Notice>{error}</Notice>}

      <section className="mt-6">
        <h2 className="text-lg font-bold tracking-tight">Categories</h2>

        <form
          className="mt-4 flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            const name = newCategory.trim();
            if (!name) return;
            void run(async () => {
              await createCategory(name);
              setNewCategory("");
            });
          }}
        >
          <div className="min-w-56 flex-1">
            <label className={label} htmlFor="newCategory">
              New category
            </label>
            <input
              id="newCategory"
              className={input}
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="e.g. Electronics"
            />
          </div>
          <button type="submit" className={primaryButton}>
            Add
          </button>
        </form>

        <ul className="mt-4 flex flex-wrap gap-2">
          {categories.map((category) => (
            <li
              key={category.id}
              className="flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm"
            >
              {category.name}
              <button
                type="button"
                aria-label={`Delete ${category.name}`}
                className="text-brand-500 transition hover:text-brand-600"
                onClick={() => {
                  if (window.confirm(`Delete the "${category.name}" category?`)) {
                    void run(() => deleteCategory(category.id));
                  }
                }}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-bold tracking-tight">
          Businesses <span className="font-medium text-ink-400">({businesses.length})</span>
        </h2>

        <ul className="mt-4 flex flex-col gap-3">
          {businesses.map((business) => (
            <li
              key={business.id}
              className="flex flex-wrap items-center gap-3 rounded-[10px] border border-line p-3"
            >
              <div className="min-w-0 flex-1">
                <Link href={`/business?id=${business.id}`} className="truncate font-semibold hover:text-brand-500">
                  {business.name}
                </Link>
                <p className="truncate text-sm text-ink-400">
                  {[business.city, business.phone].filter(Boolean).join(" · ") || "No contact details"}
                </p>
              </div>

              {business.isHidden && (
                <span className="rounded-full bg-ink-900/5 px-3 py-1 text-xs font-semibold text-ink-600">
                  Hidden
                </span>
              )}

              <button
                type="button"
                className={ghostButton}
                onClick={() => void run(() => setBusinessVisibility(business.id, !business.isHidden))}
              >
                {business.isHidden ? "Unhide" : "Hide"}
              </button>

              <button
                type="button"
                className="rounded-[10px] px-4 py-3 text-[15px] font-semibold text-brand-600 transition hover:bg-brand-100"
                onClick={() => {
                  if (window.confirm(`Delete "${business.name}" and everything in it?`)) {
                    void run(() => adminDeleteBusiness(business.id));
                  }
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>
    </DashboardShell>
  );
}
