"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Nav } from "@/components/Nav";
import { BusinessReviews } from "@/components/BusinessReviews";
import { Notice } from "@/components/dashboard/DashboardShell";
import { getBusiness, getBusinessProducts, type Business, type Product } from "@/lib/api";
import { formatPrice, whatsappHref } from "@/lib/formatPrice";
import { getCurrentUserId } from "@/lib/supabase";

/**
 * Business detail, mirroring the mobile app's business/[id] screen.
 *
 * The id travels as a query parameter rather than a path segment: this site is a
 * static export, so a dynamic route would have to know every business id at build
 * time. useSearchParams needs a Suspense boundary under that setup.
 */
export default function BusinessPage() {
  return (
    <Suspense fallback={<Nav />}>
      <BusinessDetail />
    </Suspense>
  );
}

function BusinessDetail() {
  const params = useSearchParams();
  const id = Number(params.get("id"));
  const highlightId = Number(params.get("item")) || null;

  const [business, setBusiness] = useState<Business | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(id) || id <= 0) {
      setError("No business selected.");
      setLoading(false);
      return;
    }
    let active = true;
    Promise.all([getBusiness(id), getBusinessProducts(id)])
      .then(([b, p]) => {
        if (!active) return;
        setBusiness(b);
        setProducts(p);
      })
      .catch((e: unknown) =>
        active && setError(e instanceof Error ? e.message : "Could not load this business."),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <>
        <Nav />
        <main className="mx-auto w-full max-w-4xl px-5 py-10">
          <div className="h-56 animate-pulse rounded-[10px] bg-ink-900/5" />
        </main>
      </>
    );
  }

  if (error || !business) {
    return (
      <>
        <Nav />
        <main className="mx-auto w-full max-w-4xl px-5 py-10">
          <Notice>{error ?? "Business not found."}</Notice>
        </main>
      </>
    );
  }

  const ordered = highlightId
    ? [...products].sort((a, b) => (a.id === highlightId ? -1 : b.id === highlightId ? 1 : 0))
    : products;

  const mapsHref =
    business.latitude != null && business.longitude != null
      ? `https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`
      : null;

  return (
    <>
      <Nav />

      {business.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={business.imageUrl} alt="" className="h-56 w-full object-cover sm:h-72" />
      )}

      <main className="mx-auto w-full max-w-4xl px-5 py-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{business.name}</h1>

        {business.categories.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {business.categories.map((category) => (
              <li
                key={category.id}
                className="rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-500"
              >
                {category.name}
              </li>
            ))}
          </ul>
        )}

        {business.description && <p className="mt-4 text-ink-600">{business.description}</p>}

        <div className="mt-6 divide-y divide-line rounded-[10px] border border-line">
          {(business.address || business.city) && (
            <p className="px-4 py-3 text-[15px] text-ink-600">
              {[business.address, business.city].filter(Boolean).join(", ")}
            </p>
          )}

          {(business.openingTime || business.closingTime) && (
            <p className="px-4 py-3 text-[15px] text-ink-600">
              {business.openingTime && business.closingTime
                ? `Open ${business.openingTime} – ${business.closingTime}`
                : business.openingTime
                  ? `Opens at ${business.openingTime}`
                  : `Closes at ${business.closingTime}`}
            </p>
          )}

          {mapsHref && (
            <a
              href={mapsHref}
              target="_blank"
              rel="noreferrer"
              className="block px-4 py-3 text-[15px] font-medium text-brand-500 transition hover:bg-brand-50"
            >
              Open in Google Maps
            </a>
          )}

          {/* Contacts open WhatsApp, never the dialer — same as the app. */}
          {business.phone && (
            <>
              <a
                href={whatsappHref(business.phone)}
                target="_blank"
                rel="noreferrer"
                className="block px-4 py-3 text-[15px] font-medium text-brand-500 transition hover:bg-brand-50"
              >
                {business.phone}
              </a>
              <a
                href={whatsappHref(business.phone)}
                target="_blank"
                rel="noreferrer"
                className="block px-4 py-3 text-[15px] font-medium text-[#25D366] transition hover:bg-brand-50"
              >
                Contact on WhatsApp
              </a>
            </>
          )}
        </div>

        <section className="mt-10">
          <h2 className="text-lg font-bold tracking-tight">Products &amp; Merchandise</h2>

          {ordered.length === 0 ? (
            <p className="mt-3 text-ink-600">No items listed yet.</p>
          ) : (
            <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {ordered.map((product) => (
                <li
                  key={product.id}
                  className={`overflow-hidden rounded-[10px] border transition ${
                    product.id === highlightId ? "border-brand-500" : "border-line"
                  }`}
                >
                  {product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.imageUrl} alt="" className="h-44 w-full object-cover" />
                  ) : (
                    <div className="h-44 w-full bg-ink-900/5" />
                  )}
                  <div className="p-4">
                    <p className="font-semibold">{product.name}</p>
                    {formatPrice(product.price, product.priceType) && (
                      <p className="mt-1 text-sm font-semibold text-brand-500">
                        {formatPrice(product.price, product.priceType)}
                      </p>
                    )}
                    {product.description && (
                      <p className="mt-2 line-clamp-3 text-sm text-ink-600">{product.description}</p>
                    )}

                    {product.videoUrl && (
                      <video
                        src={product.videoUrl}
                        controls
                        playsInline
                        className="mt-3 w-full rounded-[8px] border border-line"
                      />
                    )}

                    <ul className="mt-3 flex flex-wrap gap-1.5 text-xs text-ink-400">
                      {product.condition && <li className="rounded-full bg-ink-900/5 px-2 py-1">{product.condition}</li>}
                      {product.size && <li className="rounded-full bg-ink-900/5 px-2 py-1">Size {product.size}</li>}
                      {product.color && <li className="rounded-full bg-ink-900/5 px-2 py-1">{product.color}</li>}
                      {product.deliveredByBusiness && (
                        <li className="rounded-full bg-ink-900/5 px-2 py-1">Delivered by business</li>
                      )}
                      {product.deliveredByPricedUg && (
                        <li className="rounded-full bg-ink-900/5 px-2 py-1">Delivered by Priced Ug</li>
                      )}
                    </ul>

                    {business.phone && (
                      <a
                        href={whatsappHref(
                          business.phone,
                          `Hi, I'm interested in "${product.name}" on Priced Ug.`,
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 block rounded-[10px] bg-[#25D366] px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:brightness-95"
                      >
                        Inquire on WhatsApp
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <BusinessReviews
          businessId={business.id}
          isOwner={getCurrentUserId() === business.clerkUserId}
        />
      </main>
    </>
  );
}
