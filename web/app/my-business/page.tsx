"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  deleteMyBusiness,
  deleteUploadedFiles,
  getMyBusiness,
  getMyProducts,
  type Business,
  type Product,
} from "@/lib/api";
import { BusinessForm } from "@/components/dashboard/BusinessForm";
import { MediaBadges } from "@/components/MediaBadges";
import {
  DashboardShell,
  Notice,
  RequireSignIn,
  dangerButton,
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
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState<string | null>(null);

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

  /*
    Two confirmations, and the first one spells out what goes with it — this
    removes the listing every buyer sees, not just the dashboard entry.
  */
  const handleDelete = async () => {
    if (!business) return;
    const ok = window.confirm(
      `This permanently deletes "${business.name}", its ${products.length} product${
        products.length === 1 ? "" : "s"
      } and every review left for it. This cannot be undone.`,
    );
    if (!ok) return;

    // Collected before the rows go, since the URLs only live on them.
    const mediaUrls = [
      business.imageUrl,
      ...products.flatMap((p) => [p.imageUrl, p.videoUrl, ...(p.imageUrls ?? [])]),
    ];

    setDeleting(true);
    setError(null);
    try {
      await deleteMyBusiness();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete your business.");
      setDeleting(false);
      return;
    }

    /*
      The business is gone at this point. A storage failure leaves orphaned
      files, which is worth saying but is not a failed deletion.
    */
    try {
      await deleteUploadedFiles(mediaUrls);
      setDeleted(
        "Your business page, its products, reviews and uploaded photos and videos have all been permanently deleted.",
      );
    } catch {
      setDeleted(
        "Your business page, its products and reviews have been permanently deleted. Some uploaded photos or videos could not be removed from storage.",
      );
    }
    setBusiness(null);
    setProducts([]);
    setDeleting(false);
  };

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
        title={deleted ? "Business deleted" : "Create your business page"}
        description={
          deleted
            ? undefined
            : "Add your business so buyers can find you, then list what you sell."
        }
      >
        {deleted ? <Notice tone="info">{deleted}</Notice> : <BusinessForm business={null} />}
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
        <button
          type="button"
          onClick={() => void handleDelete()}
          disabled={deleting}
          className={dangerButton}
        >
          {deleting ? "Deleting…" : "Delete business"}
        </button>
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
                <div className="relative shrink-0">
                  {product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.imageUrl}
                      alt=""
                      className="size-20 rounded-[8px] object-cover"
                    />
                  ) : (
                    <div className="size-20 rounded-[8px] bg-ink-900/5" />
                  )}
                  <MediaBadges
                    photoCount={product.imageUrls?.length}
                    hasVideo={!!product.videoUrl}
                    compact
                  />
                </div>
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
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </DashboardShell>
  );
}
