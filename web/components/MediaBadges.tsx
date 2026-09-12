/**
 * Marks a card whose cover hides more: how many photos there are, and whether
 * the item has a video. The mobile app shows the same pair over its thumbnails.
 */
export function MediaBadges({
  photoCount,
  hasVideo,
  compact = false,
}: {
  photoCount?: number | null;
  hasVideo?: boolean | null;
  /** Drops the words, for a thumbnail too narrow to fit them. */
  compact?: boolean;
}) {
  const count = photoCount ?? 0;
  if (count < 2 && !hasVideo) return null;

  const badge = `rounded-full bg-black/55 font-semibold text-white ${
    compact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-[11px]"
  }`;

  return (
    <div
      className={`pointer-events-none absolute flex gap-1 ${compact ? "left-1 top-1" : "left-2 top-2"}`}
    >
      {count > 1 && (
        <span className={badge} title={`${count} photos`}>
          {compact ? count : `${count} photos`}
        </span>
      )}
      {hasVideo && (
        <span className={badge} title="Has video">
          {compact ? "▶" : "▶ Video"}
        </span>
      )}
    </div>
  );
}
