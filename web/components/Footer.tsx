import Image from "next/image";
import Link from "next/link";
import { links, site } from "@/content/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-12 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.svg" alt="" width={28} height={28} className="size-7" />
            <span className="font-bold tracking-tight">{site.name}</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-ink-600">{site.tagline}.</p>
        </div>

        <nav aria-label="Footer" className="flex flex-col gap-2 text-sm">
          <Link href="/#how-it-works" className="text-ink-600 transition hover:text-brand-500">
            How it works
          </Link>
          <Link href="/#features" className="text-ink-600 transition hover:text-brand-500">
            Features
          </Link>
          <Link href="/#team" className="text-ink-600 transition hover:text-brand-500">
            Leadership
          </Link>
          <Link href="/privacy" className="text-ink-600 transition hover:text-brand-500">
            Privacy Policy
          </Link>
          <a
            href={`mailto:${links.email}`}
            className="text-ink-600 transition hover:text-brand-500"
          >
            {links.email}
          </a>
        </nav>
      </div>

      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-5 py-6 text-xs text-ink-400">
          © {year} {site.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
