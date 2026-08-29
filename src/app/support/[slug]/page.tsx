import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SupportArticle } from "@/components/SupportArticle";
import { listSupportDocs, getSupportDoc, type SupportDoc } from "@/lib/support";
import { IS_INDEXABLE, SITE_URL } from "@/lib/site";

/** Support articles — one static page per KB doc at /support/<slug> (Support Track, #546).
 *  Content is repo markdown (Claude-generated), so all slugs are known at build; no on-demand pages. */
export const dynamicParams = false;

export async function generateStaticParams() {
  const docs = await listSupportDocs();
  return docs.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getSupportDoc(slug);
  if (!doc) return {};
  const canonical = `/support/${doc.slug}`;
  return {
    title: { absolute: `${doc.title} — HaldiTech Support` },
    description: doc.summary,
    alternates: { canonical },
    ...(IS_INDEXABLE ? {} : { robots: { index: false, follow: false } }),
  };
}

/** #499: schema.org JSON-LD for a KB article — an `Article` (feeds Google rich results + AEO/answer
 *  engines with a clean title/description/publisher) plus a `BreadcrumbList` mirroring the on-page
 *  Support → article trail. URLs are the public apex (SITE_URL = halditech.com/support/<slug>), the
 *  canonical this zone serves under.
 *
 *  Deliberately NOT emitting FAQPage: these docs are how-to guides, not genuine visible Q&A, and
 *  Google penalises FAQ markup that doesn't match visible question/answer content. FAQPage should be
 *  added only for articles actually authored as FAQs (#499 follow-up). */
function articleJsonLd(doc: SupportDoc) {
  const url = `${SITE_URL}/support/${doc.slug}`;
  const org = { "@type": "Organization", name: "HaldiTech", url: SITE_URL };
  return [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: doc.title,
      ...(doc.summary ? { description: doc.summary } : {}),
      url,
      mainEntityOfPage: url,
      inLanguage: "en-US",
      ...(doc.tags.length ? { keywords: doc.tags.join(", ") } : {}),
      author: org,
      publisher: {
        ...org,
        logo: { "@type": "ImageObject", url: `${SITE_URL}/brand/logo-light-on-dark.png` },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Support", item: `${SITE_URL}/support` },
        { "@type": "ListItem", position: 2, name: doc.title, item: url },
      ],
    },
  ];
}

export default async function SupportArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = await getSupportDoc(slug);
  if (!doc) notFound();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(doc)) }}
      />
      <SupportArticle doc={doc} />
    </>
  );
}
