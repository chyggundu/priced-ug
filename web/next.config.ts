import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the build root to `web/`. Without this, Next walks up, finds the monorepo
  // lockfile at ../pnpm-workspace.yaml and treats the repo root as the project
  // root — dragging the mobile app's tree into this build. The website is
  // deliberately standalone.
  turbopack: { root: path.resolve(import.meta.dirname) },

  // Builds plain HTML/CSS/JS into `out/`, so the site can be hosted on any static
  // host (Vercel, Netlify, Replit, cPanel, S3). The site has no backend.
  output: "export",

  // next/image optimisation needs a server, which a static export does not have.
  images: { unoptimized: true },

  // Emits `privacy/index.html` rather than `privacy.html`, so hosts that do not
  // rewrite extensions still serve /privacy correctly.
  trailingSlash: true,
};

export default nextConfig;
