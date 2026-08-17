"use client";

import { useEffect, useRef, useState } from "react";

type RevealProps = {
  children: React.ReactNode;
  /** Stagger offset in ms — use index * 70 or so within a grid. */
  delay?: number;
  className?: string;
};

/**
 * Fades and lifts its children into view once, when scrolled to.
 *
 * The hidden state lives in CSS (`.reveal` in globals.css) so there is no
 * first-paint flash. Users with `prefers-reduced-motion` are shown the content
 * immediately, and a <noscript> rule in the layout reveals everything if JS
 * never runs — the markup must never depend on this component to be visible.
 */
export function Reveal({ children, delay = 0, className = "" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }

    // Reveal immediately if the element is already in the viewport
    // (e.g. the page was anchored to this section, or it is above the fold).
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setShown(true);
      return;
    }

    // Fallback: guarantee content is visible after 300 ms in environments where
    // IntersectionObserver does not fire reliably (embedded iframes, etc.).
    const fallback = setTimeout(() => setShown(true), 300);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          clearTimeout(fallback);
          io.disconnect(); // reveal once; do not re-hide on scroll back up
        }
      },
      { threshold: 0.05 },
    );

    io.observe(el);
    return () => {
      clearTimeout(fallback);
      io.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      data-shown={shown}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={`reveal ${className}`}
    >
      {children}
    </div>
  );
}
