"use client";

import { useState } from "react";
import { uploadFile } from "@/lib/api";
import { label } from "./DashboardShell";

/**
 * Picks files from disk and uploads them to the same Supabase bucket the app
 * uses, returning public URLs. Used for the business banner (single) and product
 * photos (up to `max`).
 */
export function ImageField({
  title,
  urls,
  onChange,
  max = 1,
  accept = "image/*",
  hint,
}: {
  title: string;
  urls: string[];
  onChange: (urls: string[]) => void;
  max?: number;
  accept?: string;
  hint?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError(null);
    setBusy(true);
    try {
      const room = max - urls.length;
      const picked = Array.from(files).slice(0, Math.max(room, 0));
      const uploaded: string[] = [];
      for (const file of picked) {
        uploaded.push(await uploadFile(file));
      }
      onChange([...urls, ...uploaded].slice(0, max));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <span className={label}>{title}</span>
      {hint && <p className="mt-1 text-sm text-ink-400">{hint}</p>}

      {urls.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-3">
          {urls.map((url) => (
            <li key={url} className="relative">
              {/* Plain <img>: these are runtime Supabase URLs and the site is a
                  static export with image optimisation disabled anyway. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className="size-24 rounded-[10px] border border-line object-cover"
              />
              <button
                type="button"
                onClick={() => onChange(urls.filter((u) => u !== url))}
                aria-label="Remove"
                className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white shadow-sm"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {urls.length < max && (
        <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-[10px] border border-dashed border-line px-4 py-3 text-sm font-medium text-ink-600 transition hover:border-brand-500 hover:text-brand-500">
          <input
            type="file"
            accept={accept}
            multiple={max > 1}
            className="sr-only"
            disabled={busy}
            onChange={(e) => {
              void handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
          {busy ? "Uploading…" : max > 1 ? "Add photos" : "Choose image"}
        </label>
      )}

      {error && <p className="mt-2 text-sm text-brand-600">{error}</p>}
    </div>
  );
}
