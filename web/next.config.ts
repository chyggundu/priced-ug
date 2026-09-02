import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The site ships as a static export (web/out) — there is no Node server in
  // front of it, so every route must be prerenderable.
  output: "export",
  trailingSlash: true,
  images: {
    // next/image's optimizer needs a server; a static export has none.
    unoptimized: true,
  },
};

export default nextConfig;
