"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getFavorites, type Favorites } from "@/lib/api";
import { DashboardShell, Notice, RequireSignIn } from "@/components/dashboard/DashboardShell";
import { formatPrice } from "@/lib/formatPrice";

/** Mirrors the mobile app's favorites screen. */
export default function FavoritesPage() {
  return (
    <RequireSignIn>
      <FavoritesList />
    </RequireSignIn>
  );
}

function FavoritesList() {
  const [favorites, setFavorites] = useState<Favorites>({ businesses: [], products: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getFavorites()
      .then(setFavorites)
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Could not load your favourites."),
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardShell title="Favourites">
        <div className="h-32 animate-pulse rounded-[10px] bg-ink-900/5" />
      </DashboardShell>
    );
  }

  const empty = favorites.businesses.length === 0 && favorites.products.length === 0;

  return (
    <DashboardShell title="Favourites" description="Businesses and items you saved.">
      {error && <Notice>{error}</Notice>}

      {empty && !error && (
        <p className="text-ink-600">
          Nothing saved yet. Browse the{" "}
          <Link href="/browse" className="font-medium text-brand-500 hover:text-brand-600">
            marketplace
          </Link>{" "}
          to find something.
        </p>
      )}

      {favorites.businesses.length > 0 && (
        <section>
          <h2 className="text-lg font-bold tracking-tight">Businesses</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {favorites.businesses.map((business) => (
              <li key={business.id}>
                <Link
                  href={`/business?id=${business.id}`}
                  className="flex gap-4 rounded-[10px] border border-line p-3 transition hover:border-brand-500"
                >
                  {business.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={business.imageUrl} alt="" className="size-16 rounded-[8px] object-cover" />
                  ) : (
                    <div className="size-16 rounded-[8px] bg-ink-900/5" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{business.name}</p>
                    {business.city && <p className="text-sm text-ink-400">{business.city}</p>}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {favorites.products.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-bold tracking-tight">Items</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {favorites.products.map((product) => (
              <li key={product.id}>
                <Link
                  href={`/business?id=${product.businessId}&item=${product.id}`}
                  className="flex gap-4 rounded-[10px] border border-line p-3 transition hover:border-brand-500"
                >
                  {product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.imageUrl} alt="" className="size-16 rounded-[8px] object-cover" />
                  ) : (
                    <div className="size-16 rounded-[8px] bg-ink-900/5" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{product.name}</p>
                    {formatPrice(product.price, product.priceType) && (
                      <p className="text-sm text-brand-500">
                        {formatPrice(product.price, product.priceType)}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </DashboardShell>
  );
}
