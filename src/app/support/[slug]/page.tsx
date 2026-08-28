import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SupportArticle } from "@/components/SupportArticle";
import { listSupportDocs, getSupportDoc } from "@/lib/support";
import { IS_INDEXABLE } from "@/lib/site";

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

export default async function SupportArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = await getSupportDoc(slug);
  if (!doc) notFound();
  return <SupportArticle doc={doc} />;
}
