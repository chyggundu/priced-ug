"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getMyBusiness, getMyProducts, type Business, type Product } from "@/lib/api";
import { BusinessForm } from "@/components/dashboard/BusinessForm";
import {
  DashboardShell,
  Notice,
  RequireSignIn,
  ghostButton,
  primaryButton,
} from "@/components/dashboard/DashboardShell";

/** Mirrors the mobile app's My Business tab: the business page plus its items. */
export default function MyBusinessPage() {
  return (
    <RequireSignIn>
      <MyBusiness />
    </RequireSignIn>
  );
}

function MyBusiness() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const mine = await getMyBusiness();
      setBusiness(mine);
      setProducts(mine ? await getMyProducts(mine.id) : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load your business.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <DashboardShell title="My business">
        <div className="h-40 animate-pulse rounded-[10px] bg-ink-900/5" />
      </DashboardShell>
    );
  }

  if (error) {
    return (
      <DashboardShell title="My business">
        <Notice>{error}</Notice>
      </DashboardShell>
    );
  }

  if (!business) {
    return (
      <DashboardShell
        title="Create your business page"
        description="Add your business so buyers can find you, then list what you sell."
      >
        <BusinessForm business={null} />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title={business.name} description={business.description ?? undefined}>
      <div className="flex flex-wrap gap-3">
        <Link href="/my-business/add-product" className={primaryButton}>
          Add item
        </Link>
        <Link href="/my-business/edit" className={ghostButton}>
          Edit business page
        </Link>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-bold tracking-tight">
          Products &amp; Merchandise{" "}
          <span className="font-medium text-ink-400">({products.length})</span>
        </h2>

        {products.length === 0 ? (
          <p className="mt-3 text-ink-600">
            No items yet. Use <strong>Add item</strong> to list your first one.
          </p>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {products.map((product) => (
              <li
                key={product.id}
                className="flex gap-4 rounded-[10px] border border-line p-3 transition hover:border-brand-500"
              >
                {product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.imageUrl}
                    alt=""
                    className="size-20 shrink-0 rounded-[8px] object-cover"
                  />
                ) : (
                  <div className="size-20 shrink-0 rounded-[8px] bg-ink-900/5" />
                )}
                <div className="min-w-0">
                  <p className="truncate font-semibold">{product.name}</p>
                  {product.price && (
                    <p className="mt-0.5 text-sm text-brand-500">
                      {product.priceType === "from"
                        ? `From UGX ${product.price}`
                        : product.priceType === "upto"
                          ? `Up to UGX ${product.price}`
                          : `UGX ${product.price}`}
                    </p>
                  )}
                  {product.categoryName && (
                    <p className="mt-0.5 truncate text-sm text-ink-400">{product.categoryName}</p>
                  )}
                  {product.videoUrl && (
                    <p className="mt-0.5 text-xs font-medium text-ink-400">Has video</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </DashboardShell>
  );
}
