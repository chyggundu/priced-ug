"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Rect = { x: number; y: number; w: number; h: number };
type Corner = "tl" | "tr" | "bl" | "br";

/** Ratio presets. `null` is a free-form box the user drags to any shape. */
const ASPECTS: { label: string; value: number | null }[] = [
  { label: "Free", value: null },
  { label: "1:1", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "3:4", value: 3 / 4 },
  { label: "16:9", value: 16 / 9 },
];

const MIN_SIDE = 32;

/** Largest box of the given ratio that fits the frame, centred. */
function centredRect(frameW: number, frameH: number, aspect: number | null): Rect {
  if (!aspect) return { x: 0, y: 0, w: frameW, h: frameH };
  let w = frameW;
  let h = w / aspect;
  if (h > frameH) {
    h = frameH;
    w = h * aspect;
  }
  return { x: (frameW - w) / 2, y: (frameH - h) / 2, w, h };
}

/**
 * Optional crop step for a picture that has already been uploaded.
 *
 * Nothing on the site crops by itself — photos are stored and shown whole — so
 * this is the one place a picture is trimmed, and only when the owner clicks
 * Crop. The box starts as the whole picture, so clicking Save without moving it
 * changes nothing.
 *
 * The source is fetched into a blob URL rather than pointed at directly: a
 * canvas drawn from a cross-origin <img> is tainted and cannot be exported.
 */
export function ImageCropper({
  src,
  onCancel,
  onCropped,
}: {
  src: string;
  onCancel: () => void;
  onCropped: (file: File) => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [frame, setFrame] = useState<{ w: number; h: number } | null>(null);
  const [rect, setRect] = useState<Rect | null>(null);
  const [aspect, setAspect] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const drag = useRef<{ corner: Corner | null; startX: number; startY: number; start: Rect } | null>(null);

  useEffect(() => {
    let revoked: string | null = null;
    let cancelled = false;
    fetch(src)
      .then((res) => (res.ok ? res.blob() : Promise.reject(new Error(`Could not load the picture (${res.status}).`))))
      .then((blob) => {
        if (cancelled) return;
        revoked = URL.createObjectURL(blob);
        setObjectUrl(revoked);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load the picture.");
      });
    return () => {
      cancelled = true;
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [src]);

  // Escape closes, and the page behind must not scroll under the overlay.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onCancel]);

  const measure = useCallback(() => {
    const img = imgRef.current;
    if (!img || !img.clientWidth || !img.clientHeight) return;
    const size = { w: img.clientWidth, h: img.clientHeight };
    setFrame(size);
    setRect((current) => current ?? { x: 0, y: 0, w: size.w, h: size.h });
  }, []);

  useEffect(() => {
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const clamp = useCallback(
    (r: Rect): Rect => {
      if (!frame) return r;
      const w = Math.min(Math.max(r.w, MIN_SIDE), frame.w);
      const h = Math.min(Math.max(r.h, MIN_SIDE), frame.h);
      return {
        w,
        h,
        x: Math.min(Math.max(r.x, 0), frame.w - w),
        y: Math.min(Math.max(r.y, 0), frame.h - h),
      };
    },
    [frame],
  );

  const onPointerDown = (corner: Corner | null) => (e: React.PointerEvent) => {
    if (!rect) return;
    e.preventDefault();
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    drag.current = { corner, startX: e.clientX, startY: e.clientY, start: rect };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const state = drag.current;
    if (!state || !frame) return;
    const dx = e.clientX - state.startX;
    const dy = e.clientY - state.startY;
    const start = state.start;

    if (!state.corner) {
      setRect(clamp({ ...start, x: start.x + dx, y: start.y + dy }));
      return;
    }

    // Corners pull their own edges; the opposite edges stay pinned.
    const pullsRight = state.corner === "tr" || state.corner === "br";
    const pullsBottom = state.corner === "bl" || state.corner === "br";
    const right = start.x + start.w;
    const bottom = start.y + start.h;
    let w = pullsRight ? start.w + dx : start.w - dx;
    let h = pullsBottom ? start.h + dy : start.h - dy;

    if (aspect) {
      // Follow whichever side moved further, so a locked ratio still feels
      // like a direct drag.
      if (Math.abs(dx) > Math.abs(dy)) h = w / aspect;
      else w = h * aspect;
    }

    w = Math.min(Math.max(w, MIN_SIDE), frame.w);
    h = Math.min(Math.max(h, MIN_SIDE), frame.h);
    if (aspect) {
      // Re-derive after the limits, or a clamp would skew the ratio.
      if (w / aspect > frame.h) w = frame.h * aspect;
      h = w / aspect;
    }

    setRect(clamp({ x: pullsRight ? start.x : right - w, y: pullsBottom ? start.y : bottom - h, w, h }));
  };

  const endDrag = () => {
    drag.current = null;
  };

  const chooseAspect = (value: number | null) => {
    setAspect(value);
    if (frame) setRect(centredRect(frame.w, frame.h, value));
  };

  const save = async () => {
    const img = imgRef.current;
    if (!img || !rect || !frame) return;
    setSaving(true);
    try {
      const scaleX = img.naturalWidth / frame.w;
      const scaleY = img.naturalHeight / frame.h;
      const width = Math.max(1, Math.round(rect.w * scaleX));
      const height = Math.max(1, Math.round(rect.h * scaleY));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Could not prepare the picture.");
      context.drawImage(
        img,
        Math.round(rect.x * scaleX),
        Math.round(rect.y * scaleY),
        width,
        height,
        0,
        0,
        width,
        height,
      );
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.9),
      );
      if (!blob) throw new Error("Could not save the cropped picture.");
      onCropped(new File([blob], "crop.jpg", { type: "image/jpeg" }));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not save the cropped picture.");
    } finally {
      setSaving(false);
    }
  };

  const handle = "absolute size-7 border-white bg-white/30";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Crop picture"
      className="fixed inset-0 z-50 flex flex-col bg-black/95"
    >
      <div className="flex items-center justify-between px-5 py-4 text-white">
        <button type="button" onClick={onCancel} className="text-sm font-semibold">
          Cancel
        </button>
        <span className="text-sm font-semibold">Crop picture</span>
        <button
          type="button"
          onClick={save}
          disabled={saving || !rect}
          className="text-sm font-bold disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      <div className="flex flex-1 items-center justify-center overflow-hidden px-4">
        {error ? (
          <p className="max-w-sm text-center text-sm text-white">{error}</p>
        ) : objectUrl ? (
          <div
            className="relative touch-none select-none"
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={objectUrl}
              alt=""
              onLoad={measure}
              draggable={false}
              className="max-h-[70vh] max-w-full object-contain"
            />
            {rect && (
              <>
                {/* Dim everything outside the selection, so what will be kept
                    is obvious before saving. */}
                <div className="absolute inset-x-0 top-0 bg-black/55" style={{ height: rect.y }} />
                <div className="absolute inset-x-0 bottom-0 bg-black/55" style={{ top: rect.y + rect.h }} />
                <div className="absolute left-0 bg-black/55" style={{ top: rect.y, width: rect.x, height: rect.h }} />
                <div
                  className="absolute right-0 bg-black/55"
                  style={{ top: rect.y, left: rect.x + rect.w, height: rect.h }}
                />

                <div
                  onPointerDown={onPointerDown(null)}
                  className="absolute cursor-move border-2 border-white"
                  style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}
                >
                  <span
                    onPointerDown={onPointerDown("tl")}
                    className={`${handle} -left-0.5 -top-0.5 cursor-nwse-resize border-l-4 border-t-4`}
                  />
                  <span
                    onPointerDown={onPointerDown("tr")}
                    className={`${handle} -right-0.5 -top-0.5 cursor-nesw-resize border-r-4 border-t-4`}
                  />
                  <span
                    onPointerDown={onPointerDown("bl")}
                    className={`${handle} -bottom-0.5 -left-0.5 cursor-nesw-resize border-b-4 border-l-4`}
                  />
                  <span
                    onPointerDown={onPointerDown("br")}
                    className={`${handle} -bottom-0.5 -right-0.5 cursor-nwse-resize border-b-4 border-r-4`}
                  />
                </div>
              </>
            )}
          </div>
        ) : (
          <p className="text-sm text-white">Loading…</p>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-2 px-5 py-5">
        {ASPECTS.map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={() => chooseAspect(option.value)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              aspect === option.value ? "bg-white text-black" : "bg-white/15 text-white hover:bg-white/25"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
