"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/react";
import { addFavorite, getFavorites, removeFavorite } from "@/lib/api";
import { isClerkConfigured } from "@/lib/clerk";

/**
 * The heart toggle from the mobile app's browse grid and business screen.
 *
 * Favourites are per-user rows behind RLS, so this only renders for signed-in
 * visitors — an anonymous heart would fail on click with a permission error.
 */
export function FavoriteButton({
  businessId,
  productId,
  className = "",
}: {
  businessId?: number;
  productId?: number;
  className?: string;
}) {
  if (!isClerkConfigured) return null;
  return <FavoriteToggle businessId={businessId} productId={productId} className={className} />;
}

function FavoriteToggle({
  businessId,
  productId,
  className,
}: {
  businessId?: number;
  productId?: number;
  className?: string;
}) {
  const { isSignedIn } = useAuth();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isSignedIn) return;
    let active = true;
    getFavorites()
      .then((favorites) => {
        if (!active) return;
        setSaved(
          businessId != null
            ? favorites.businesses.some((b) => b.id === businessId)
            : favorites.products.some((p) => p.id === productId),
        );
      })
      .catch(() => {
        // A failed lookup just means the heart starts empty.
      });
    return () => {
      active = false;
    };
  }, [isSignedIn, businessId, productId]);

  if (!isSignedIn) return null;

  const toggle = async (event: React.MouseEvent) => {
    // These sit inside link cards; a click must not follow the link.
    event.preventDefault();
    event.stopPropagation();
    if (busy) return;

    const next = !saved;
    setSaved(next); // Optimistic: the heart should feel instant.
    setBusy(true);
    try {
      const target = businessId != null ? { businessId } : { productId };
      await (next ? addFavorite(target) : removeFavorite(target));
    } catch {
      setSaved(!next);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={saved ? "Remove from favourites" : "Save to favourites"}
      aria-pressed={saved}
      className={`flex size-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:scale-105 ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className="size-5"
        fill={saved ? "#e01e37" : "none"}
        stroke={saved ? "#e01e37" : "#545454"}
        strokeWidth="2"
        aria-hidden
      >
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
      </svg>
    </button>
  );
}
