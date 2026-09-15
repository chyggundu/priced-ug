"use client";

import { useCallback, useEffect, useState } from "react";
import { type MediaSlide, wrapIndex } from "@/lib/media";

/**
 * Full-screen viewer for item photos and videos.
 *
 * Every picture on the site opens here when clicked, at its own aspect ratio —
 * `object-contain`, never cropped. Escape and the backdrop close it; the arrow
 * keys and the on-screen arrows step through a multi-slide item, wrapping at
 * both ends.
 */
export function MediaLightbox({
  slides,
  index,
  onIndexChange,
  onClose,
}: {
  slides: MediaSlide[];
  /** Which slide to show; `null` keeps the lightbox closed. */
  index: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const open = index !== null && slides.length > 0;

  const step = useCallback(
    (delta: number) => {
      if (index === null) return;
      onIndexChange(wrapIndex(index + delta, slides.length));
    },
    [index, onIndexChange, slides.length],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    // The page behind must not scroll while the overlay owns the screen.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose, step]);

  if (!open) return null;

  const current = slides[wrapIndex(index, slides.length)];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Media viewer"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full bg-white/15 text-2xl leading-none text-white transition hover:bg-white/25"
      >
        ×
      </button>

      {slides.length > 1 && (
        <span className="pointer-events-none absolute left-4 top-5 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold text-white">
          {wrapIndex(index, slides.length) + 1}/{slides.length}
        </span>
      )}

      {slides.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous"
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
            className="absolute left-3 z-10 flex size-11 items-center justify-center rounded-full bg-white/15 text-2xl leading-none text-white transition hover:bg-white/25"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
            className="absolute right-3 z-10 flex size-11 items-center justify-center rounded-full bg-white/15 text-2xl leading-none text-white transition hover:bg-white/25"
          >
            ›
          </button>
        </>
      )}

      {/* Stops a click on the media itself from closing, so the video's own
          controls stay usable. */}
      <div className="max-h-[92vh] w-full max-w-5xl px-4" onClick={(e) => e.stopPropagation()}>
        {current.type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current.uri}
            alt=""
            className="mx-auto max-h-[92vh] w-auto max-w-full object-contain"
          />
        ) : (
          <video
            src={current.uri}
            controls
            autoPlay
            playsInline
            className="mx-auto max-h-[92vh] w-auto max-w-full bg-black object-contain"
          />
        )}
      </div>
    </div>
  );
}

/**
 * Holds which slide of a given item is open. One hook per media strip, so two
 * items on the same page never fight over the lightbox.
 */
export function useLightbox() {
  const [index, setIndex] = useState<number | null>(null);
  return {
    index,
    open: (at: number) => setIndex(at),
    close: () => setIndex(null),
    setIndex: (at: number) => setIndex(at),
  };
}
