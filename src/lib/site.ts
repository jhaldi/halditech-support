/**
 * Site config for the Support Track (halditech.com/support). Fail-closed indexability, matching the
 * website's WEB-03 §12 rule: only an explicit prod build is crawlable; everything else is noindexed,
 * so a preview deploy can never compete with halditech.com as duplicate content.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://halditech.com").replace(/\/$/, "");

// TRIM as well as lowercase — shell-piped env values can carry a trailing newline.
export const SITE_ENV = (process.env.NEXT_PUBLIC_SITE_ENV ?? "dev").trim().toLowerCase();

/** Only true production is crawlable. */
export const IS_INDEXABLE = SITE_ENV === "prod";

/**
 * Origin for this zone's own static assets (`/brand/*`, `/support-assets/*`). Under the multi-zone mount
 * at halditech.com/support, a root-relative asset path resolves against the APEX origin (the main site),
 * which doesn't have these files — so brand/screenshot assets must be ABSOLUTE to this app's own origin
 * in production. In dev/standalone the app is its own origin, so relative is correct (and avoids pulling
 * stale prod assets). Mirrors `assetPrefix` in next.config.ts. Override per-deploy with NEXT_PUBLIC_ASSET_ORIGIN.
 */
export const ASSET_ORIGIN =
  process.env.NEXT_PUBLIC_ASSET_ORIGIN ??
  (process.env.NODE_ENV === "production" ? "https://halditech-support.vercel.app" : "");
