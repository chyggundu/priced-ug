/**
 * Media list helpers shared by the product gallery, the full-screen viewer and
 * the card badges.
 *
 * Kept free of React and of React Native imports so it can be unit-tested with
 * plain `node --test`: the slide order is the one thing both clients and both
 * platforms have to agree on, and it is worth checking without a simulator.
 */

export type MediaSlide = { type: "image"; uri: string } | { type: "video"; uri: string };

/**
 * The photos followed by the video, which is how a product's media reads
 * everywhere: cover first, then the rest of the gallery, then the clip.
 *
 * `imageUrls` is the gallery column; `imageUrl` is the older single-cover
 * column, used only when the gallery is empty so rows written before the
 * gallery existed still show their picture.
 */
export function buildMediaSlides(
  imageUrl: string | null | undefined,
  imageUrls: string[] | null | undefined,
  videoUrl: string | null | undefined,
): MediaSlide[] {
  const photos = imageUrls && imageUrls.length > 0 ? imageUrls : imageUrl ? [imageUrl] : [];
  const slides: MediaSlide[] = photos
    .filter((uri): uri is string => !!uri)
    .map((uri) => ({ type: "image", uri }));
  if (videoUrl) slides.push({ type: "video", uri: videoUrl });
  return slides;
}

/** How many photos a product has, for the "3 photos" badge on a card. */
export function photoCount(
  imageUrl: string | null | undefined,
  imageUrls: string[] | null | undefined,
): number {
  if (imageUrls && imageUrls.length > 0) return imageUrls.filter(Boolean).length;
  return imageUrl ? 1 : 0;
}

/**
 * Wraps an index around the ends of the list, so the viewer's arrows keep
 * working at the first and last slide instead of dead-ending.
 */
export function wrapIndex(index: number, length: number): number {
  if (length < 1) return 0;
  return ((index % length) + length) % length;
}
