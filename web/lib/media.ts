/**
 * Media list helpers shared by the item cards, the business page strip and the
 * full-screen lightbox.
 *
 * Deliberately free of React so it can be unit-tested with plain `node --test`.
 * The mobile app keeps its own copy (the two apps share no code by design) and
 * the two must agree on slide order, which is exactly what the tests pin down.
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
 * Wraps an index around the ends of the list, so the lightbox arrows keep
 * working at the first and last slide instead of dead-ending.
 */
export function wrapIndex(index: number, length: number): number {
  if (length < 1) return 0;
  return ((index % length) + length) % length;
}

/**
 * A URL that ends in a video extension. Used by the dashboard upload field,
 * which holds plain URLs and has to decide whether to preview them with
 * `<img>` or `<video>`.
 */
export function looksLikeVideo(url: string): boolean {
  return /\.(mp4|mov|m4v|webm|ogg|ogv|avi|mkv|3gp|qt)(\?|#|$)/i.test(url);
}
