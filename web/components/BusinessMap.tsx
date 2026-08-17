/**
 * The map from the mobile app's business screen.
 *
 * OpenStreetMap's embed is an iframe, so this needs no map library and no tile
 * key — which keeps the static export dependency-free and matches the app, whose
 * map is Leaflet over the same OSM tiles.
 */
export function BusinessMap({
  latitude,
  longitude,
  name,
}: {
  latitude: number;
  longitude: number;
  name: string;
}) {
  // A small box around the pin; roughly a few streets at city scale.
  const span = 0.004;
  const bbox = [
    longitude - span,
    latitude - span,
    longitude + span,
    latitude + span,
  ].join("%2C");

  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude}%2C${longitude}`;

  return (
    <div className="mt-6 overflow-hidden rounded-[10px] border border-line">
      <iframe
        src={src}
        title={`Map showing ${name}`}
        loading="lazy"
        className="h-64 w-full border-0"
      />
      <a
        href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`}
        target="_blank"
        rel="noreferrer"
        className="block border-t border-line px-4 py-2 text-xs text-ink-400 transition hover:text-brand-500"
      >
        View larger map · © OpenStreetMap contributors
      </a>
    </div>
  );
}
