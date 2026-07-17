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

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect(); // reveal once; do not re-hide on scroll back up
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    io.observe(el);
    return () => io.disconnect();
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
