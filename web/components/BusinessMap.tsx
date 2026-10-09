"use client";

import { useEffect, useState } from "react";

/**
 * The map from the mobile app's business screen.
 *
 * OpenStreetMap's embed is an iframe, so this needs no map library and no tile
 * key — which keeps the static export dependency-free and matches the app, whose
 * map is Leaflet over the same OSM tiles.
 *
 * Most listings only ever typed a written address, so when a business has no
 * stored pin the address is geocoded with Nominatim (OSM's own geocoder: no key,
 * fair-use only) and the map is drawn from that. Nothing renders if neither a
 * pin nor a resolvable address exists.
 *
 * It renders bare (no border, no chrome) so the business page can slot it into
 * the address card the way the app does.
 */

type Coords = { latitude: number; longitude: number };

// One lookup per address for the life of the tab.
const geocodeCache = new Map<string, Coords | null>();

async function geocode(query: string): Promise<Coords | null> {
  const cached = geocodeCache.get(query);
  if (cached !== undefined) return cached;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
      { headers: { Accept: "application/json" } },
    );
    const rows = (await res.json()) as { lat: string; lon: string }[];
    const hit = rows[0]
      ? { latitude: Number(rows[0].lat), longitude: Number(rows[0].lon) }
      : null;
    geocodeCache.set(query, hit);
    return hit;
  } catch {
    geocodeCache.set(query, null);
    return null;
  }
}

export function BusinessMap({
  latitude,
  longitude,
  query,
  name,
}: {
  latitude: number | null;
  longitude: number | null;
  /** Written address, used when the business never stored a pin. */
  query: string | null;
  name: string;
}) {
  const stored = latitude != null && longitude != null ? { latitude, longitude } : null;
  const [coords, setCoords] = useState<Coords | null>(stored);

  useEffect(() => {
    if (latitude != null && longitude != null) {
      setCoords({ latitude, longitude });
      return;
    }
    if (!query) {
      setCoords(null);
      return;
    }
    let active = true;
    geocode(query).then((hit) => active && setCoords(hit));
    return () => {
      active = false;
    };
  }, [latitude, longitude, query]);

  if (!coords) return null;

  // A small box around the pin; roughly a few streets at city scale.
  const span = 0.004;
  const bbox = [
    coords.longitude - span,
    coords.latitude - span,
    coords.longitude + span,
    coords.latitude + span,
  ].join("%2C");

  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${coords.latitude}%2C${coords.longitude}`;

  return (
    <iframe
      src={src}
      title={`Map showing ${name}`}
      loading="lazy"
      className="block h-64 w-full border-0"
    />
  );
}
