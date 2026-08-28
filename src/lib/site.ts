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
