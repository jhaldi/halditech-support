import type { NextConfig } from "next";

/**
 * Multi-zone (#546): this app is mounted at halditech.com/support via a rewrite from the main site.
 * - `assetPrefix` makes the build's JS/CSS/font assets load from this app's own origin (so they don't
 *   collide with the host site's /_next), and the CORS headers below allow them to load cross-origin
 *   when the app is served under halditech.com.
 */
const ZONE_ORIGIN = "https://halditech-support.vercel.app";

const nextConfig: NextConfig = {
  // Only the deployed zone needs assets served from its own origin. In local dev the app is served
  // standalone, so pointing assetPrefix at the remote prod origin 404s every chunk and kills hydration.
  assetPrefix: process.env.NODE_ENV === "production" ? ZONE_ORIGIN : undefined,
  async headers() {
    return [
      {
        source: "/_next/:path*",
        headers: [{ key: "Access-Control-Allow-Origin", value: "*" }],
      },
      {
        source: "/support-assets/:path*",
        headers: [{ key: "Access-Control-Allow-Origin", value: "*" }],
      },
    ];
  },
};

export default nextConfig;
