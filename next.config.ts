import type { NextConfig } from "next";

/**
 * Multi-zone (#546): this app is mounted at halditech.com/support via a rewrite from the main site.
 * - `assetPrefix` makes the build's JS/CSS/font assets load from this app's own origin (so they don't
 *   collide with the host site's /_next), and the CORS headers below allow them to load cross-origin
 *   when the app is served under halditech.com.
 */
const ZONE_ORIGIN = "https://halditech-support.vercel.app";

const nextConfig: NextConfig = {
  assetPrefix: ZONE_ORIGIN,
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
