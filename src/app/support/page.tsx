import type { Metadata } from "next";
import { SupportLanding } from "@/components/SupportLanding";
import { listSupportDocs, tagsFrom } from "@/lib/support";
import { IS_INDEXABLE } from "@/lib/site";

/** The /support landing — search + tag-grouped index of every KB article (Support Track, #546).
 *  Fully static: content is repo markdown, so this rebuilds only on deploy. */
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: { absolute: "HaldiTech Support — Help Center" },
    description:
      "Guides and answers for running HaldiTech: payroll, settlements, IVMRs, integrations, and the driver app.",
    alternates: { canonical: "/support" },
    ...(IS_INDEXABLE ? {} : { robots: { index: false, follow: false } }),
  };
}

export default async function SupportLandingPage() {
  const docs = await listSupportDocs();
  const tags = tagsFrom(docs);
  const landingDocs = docs.map((d) => ({
    slug: d.slug,
    title: d.title,
    summary: d.summary,
    tags: d.tags,
  }));
  return <SupportLanding docs={landingDocs} tags={tags} />;
}
