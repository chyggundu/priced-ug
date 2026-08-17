"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "@/content/site";
import { AuthButtons } from "./AuthButtons";

const NAV_LINKS = [
  { href: "/browse", label: "Browse" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#features", label: "Features" },
  { href: "/#contact", label: "Contact" },
  { href: "/#download", label: "Get the app" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  // Lift the bar off the page once scrolling starts. Initial state matches the
  // server render (false), so there is no hydration mismatch.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 backdrop-blur-md transition duration-300 ${
        scrolled
          ? "border-b border-line/80 bg-white/85 shadow-sm shadow-black/5"
          : "border-b border-transparent bg-white/60"
      }`}
    >
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5"
      >
        <Link href="/" className="group flex items-center gap-2.5">
          <Image
            src="/logo.svg"
            alt=""
            width={32}
            height={32}
            className="size-8 transition duration-300 group-hover:-rotate-12 group-hover:scale-110"
            priority
          />
          <span className="text-lg font-bold tracking-tight">{site.name}</span>
        </Link>

        {/* Tighter gap at md: five links, the wordmark and the CTA share one row. */}
        <ul className="hidden items-center gap-5 md:flex lg:gap-7">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="relative text-sm font-medium text-ink-600 transition after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-0 after:rounded-full after:bg-brand-500 after:transition-[width] after:duration-300 hover:text-brand-500 hover:after:w-full"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <AuthButtons />
      </nav>
    </header>
  );
}
