/**
 * Nominatim is OpenStreetMap's own geocoder: no key, no quota beyond fair use.
 *
 * Most businesses only ever typed a written address, so the business screen
 * looks the address up to place its map pin. Results are cached per query for
 * the life of the session.
 */

export type Coords = { latitude: number; longitude: number };

const cache = new Map<string, Coords | null>();

export async function geocode(query: string): Promise<Coords | null> {
  const cached = cache.get(query);
  if (cached !== undefined) return cached;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
      { headers: { Accept: "application/json" } }
    );
    const rows = (await res.json()) as { lat: string; lon: string }[];
    const hit = rows[0]
      ? { latitude: Number(rows[0].lat), longitude: Number(rows[0].lon) }
      : null;
    cache.set(query, hit);
    return hit;
  } catch {
    cache.set(query, null);
    return null;
  }
}
