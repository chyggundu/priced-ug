"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Nav } from "@/components/Nav";
import { BusinessReviews } from "@/components/BusinessReviews";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ShareButton } from "@/components/ShareButton";
import { BusinessMap } from "@/components/BusinessMap";
import { Notice } from "@/components/dashboard/DashboardShell";
import { MediaLightbox, useLightbox } from "@/components/MediaLightbox";
import { buildMediaSlides } from "@/lib/media";
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

      {business.imageUrl && <BusinessBanner url={business.imageUrl} />}

      <main className="mx-auto w-full max-w-4xl px-5 py-8">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{business.name}</h1>
          <div className="flex shrink-0 items-center gap-2">
            <FavoriteButton businessId={business.id} />
            <ShareButton
              title={business.name}
              text={[business.name, business.description, business.phone]
                .filter(Boolean)
                .join("\n")}
            />
          </div>
        </div>

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

        {business.latitude != null && business.longitude != null && (
          <BusinessMap
            latitude={business.latitude}
            longitude={business.longitude}
            name={business.name}
          />
        )}

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
                  <ProductMedia product={product} />
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

/**
 * The store's header picture, shown whole rather than cropped to a banner
 * strip, and opening full-screen when clicked.
 */
function BusinessBanner({ url }: { url: string }) {
  const lightbox = useLightbox();
  return (
    <>
      <button
        type="button"
        onClick={() => lightbox.open(0)}
        aria-label="Open store picture"
        className="block w-full cursor-zoom-in bg-ink-900"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt="" className="h-56 w-full object-contain sm:h-72" />
      </button>
      <MediaLightbox
        slides={[{ type: "image", uri: url }]}
        index={lightbox.index}
        onIndexChange={lightbox.setIndex}
        onClose={lightbox.close}
      />
    </>
  );
}

/**
 * Photos followed by the video, in one strip — the same order the mobile app
 * puts them in, where the video is the last slide of the gallery rather than a
 * separate player further down the card.
 *
 * Mobile pages one slide at a time because a phone has room for one; here the
 * strip scrolls, so nothing is hidden behind a swipe. Clicking any slide opens
 * it full-screen, video included.
 *
 * Nothing is cropped: `object-contain` on a dark mat shows the seller's whole
 * picture whatever shape it is.
 */
function ProductMedia({ product }: { product: Product }) {
  const slides = buildMediaSlides(product.imageUrl, product.imageUrls, product.videoUrl);
  const lightbox = useLightbox();

  if (slides.length === 0) {
    return <div className="h-44 w-full bg-ink-900/5" />;
  }

  const frame = "h-44 bg-ink-900 object-contain";

  return (
    <>
      <ul className="flex snap-x gap-1 overflow-x-auto bg-ink-900">
        {slides.map((slide, i) => (
          <li key={`${slide.uri}-${i}`} className="shrink-0 snap-start">
            {slide.type === "image" ? (
              <button
                type="button"
                onClick={() => lightbox.open(i)}
                aria-label={`Open photo ${i + 1}`}
                className="block cursor-zoom-in"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slide.uri}
                  alt=""
                  className={`${frame} ${slides.length === 1 ? "w-full" : "w-56"}`}
                />
              </button>
            ) : (
              // The inline player keeps its own controls; the expand button
              // next to it is what opens the clip full-screen.
              <div className="relative">
                <video
                  src={slide.uri}
                  controls
                  playsInline
                  preload="metadata"
                  className={`${frame} ${slides.length === 1 ? "w-full" : "w-56"}`}
                />
                <button
                  type="button"
                  onClick={() => lightbox.open(i)}
                  aria-label="Open video"
                  className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-1 text-xs font-semibold text-white transition hover:bg-black/80"
                >
                  ⤢
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      <MediaLightbox
        slides={slides}
        index={lightbox.index}
        onIndexChange={lightbox.setIndex}
        onClose={lightbox.close}
      />
    </>
  );
}
