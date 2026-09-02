"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Nav } from "@/components/Nav";
import { Notice } from "@/components/dashboard/DashboardShell";
import { getBusinesses, type Business } from "@/lib/api";

/** Great-circle distance in km — same haversine the mobile nearby screen uses. */
function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

/** Mirrors the mobile app's nearby screen: businesses sorted by distance. */
export default function NearbyPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    getBusinesses()
      .then(setBusinesses)
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Could not load businesses."),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setLocationError("This browser cannot share your location.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => setLocationError("Location permission was denied, so distances are unavailable."),
      { enableHighAccuracy: false, timeout: 10_000 },
    );
  }, []);

  const sorted = useMemo(() => {
    const placed = businesses.filter((b) => b.latitude != null && b.longitude != null);
    if (!location) return placed.map((business) => ({ business, distance: null as number | null }));
    return placed
      .map((business) => ({
        business,
        distance: distanceKm(location.latitude, location.longitude, business.latitude!, business.longitude!),
      }))
      .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
  }, [businesses, location]);

  return (
    <>
      <Nav />
      <main className="mx-auto w-full max-w-3xl px-5 py-10">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Nearby</h1>
        <p className="mt-2 text-ink-600">Businesses that have pinned their location.</p>

        {locationError && (
          <div className="mt-6">
            <Notice tone="info">{locationError}</Notice>
          </div>
        )}
        {error && (
          <div className="mt-6">
            <Notice>{error}</Notice>
          </div>
        )}

        {loading ? (
          <div className="mt-8 h-40 animate-pulse rounded-[10px] bg-ink-900/5" />
        ) : sorted.length === 0 ? (
          <p className="mt-8 text-ink-600">No businesses have pinned a location yet.</p>
        ) : (
          <ul className="mt-8 flex flex-col gap-3">
            {sorted.map(({ business, distance }) => (
              <li key={business.id}>
                <Link
                  href={`/business?id=${business.id}`}
                  className="flex items-center gap-4 rounded-[10px] border border-line p-3 transition hover:border-brand-500"
                >
                  {business.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={business.imageUrl} alt="" className="size-14 rounded-[8px] object-cover" />
                  ) : (
                    <div className="size-14 rounded-[8px] bg-ink-900/5" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{business.name}</p>
                    {(business.address || business.city) && (
                      <p className="truncate text-sm text-ink-400">
                        {[business.address, business.city].filter(Boolean).join(", ")}
                      </p>
                    )}
                  </div>
                  {distance != null && (
                    <span className="shrink-0 rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-500">
                      {formatDistance(distance)}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
