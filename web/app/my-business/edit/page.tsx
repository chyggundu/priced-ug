"use client";

import { useEffect, useState } from "react";
import { getMyBusiness, type Business } from "@/lib/api";
import { BusinessForm } from "@/components/dashboard/BusinessForm";
import { DashboardShell, Notice, RequireSignIn } from "@/components/dashboard/DashboardShell";

/** Mirrors the mobile app's edit-business screen. */
export default function EditBusinessPage() {
  return (
    <RequireSignIn>
      <EditBusiness />
    </RequireSignIn>
  );
}

function EditBusiness() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMyBusiness()
      .then(setBusiness)
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Could not load your business."),
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardShell title="Edit business page">
        <div className="h-40 animate-pulse rounded-[10px] bg-ink-900/5" />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title={business ? "Edit business page" : "Create your business page"}>
      {error ? <Notice>{error}</Notice> : <BusinessForm business={business} />}
    </DashboardShell>
  );
}
