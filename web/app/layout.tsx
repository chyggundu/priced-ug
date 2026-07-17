import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { site } from "@/content/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  icons: {
    // SVG first so the tab shows the same brand-red tag as the header; the PNG is
    // the fallback for browsers that do not take SVG favicons.
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/favicon.png", type: "image/png", sizes: "225x225" },
    ],
    apple: "/icon.png",
  },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    url: site.url,
    images: [{ url: "/icon.png", width: 512, height: 512, alt: site.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    images: ["/icon.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      {/*
        suppressHydrationWarning: browser extensions (ColorZilla's
        `cz-shortcut-listen`, Grammarly, dark-mode tools) stamp attributes onto
        <body> before React hydrates, which React reports as a hydration
        mismatch. The markup itself is static and matches. This suppresses the
        warning for <body>'s own attributes only — it is one level deep, so real
        mismatches anywhere inside the page are still reported.
      */}
      <body className="font-sans antialiased" suppressHydrationWarning>
        {/*
          Scroll-reveal starts hidden in CSS and is turned on by JS. If JS never
          runs, that would leave the page blank — so force everything visible.
          Content must never depend on an animation to be readable.
        */}
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<style>.reveal{opacity:1!important;transform:none!important}</style>`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
