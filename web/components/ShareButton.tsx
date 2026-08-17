"use client";

import { useState } from "react";

/**
 * The share action from the mobile app's business screen. Uses the Web Share
 * sheet where the browser has one (all mobile browsers, Safari), and falls back
 * to copying the link on desktop, where Web Share is mostly absent.
 */
export function ShareButton({ title, text }: { title: string; text?: string }) {
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // Dismissing the share sheet lands here; fall through to copying.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked — nothing useful left to try.
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Share this business"
      className="flex size-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:scale-105"
    >
      {copied ? (
        <span className="text-xs font-semibold text-brand-500">✓</span>
      ) : (
        <svg
          viewBox="0 0 24 24"
          className="size-4.5"
          fill="none"
          stroke="#545454"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
        </svg>
      )}
    </button>
  );
}
