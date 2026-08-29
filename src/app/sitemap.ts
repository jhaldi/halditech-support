import type { MetadataRoute } from "next";
import { listSupportDocs } from "@/lib/support";
import { SITE_URL } from "@/lib/site";

/**
 * Sitemap for the Support Track KB (#546). Emitted at the zone root
 * (halditech-support.vercel.app/sitemap.xml) and exposed on the apex at
 * halditech.com/support-sitemap.xml via a rewrite in the halditech apps/website next.config — which
 * the apex robots.txt lists as a second sitemap. URLs are the apex canonical
 * (halditech.com/support/<slug>), the host these pages are actually served from.
 *
 * This is what keeps the 59 migrated KB articles in a sitemap now that /support has moved out of
 * apps/website into this zone (the apex sitemap no longer knows the article slugs).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const docs = await listSupportDocs();
  return [
    { url: `${SITE_URL}/support`, changeFrequency: "weekly", priority: 0.7 },
    ...docs.map((d) => ({
      url: `${SITE_URL}/support/${d.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
