import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

/**
 * Support Track (#546, Lane 2) — the support knowledge base, **Claude-generated, repo-only.**
 *
 * This is the deliberate reversal of #495: support docs are NOT team-authored via Drive. The content
 * is markdown in this repo (`content/support/<slug>/page.md`), one file per article, generated and
 * maintained by Claude. No Drive backend, no runtime fetch — the KB is fully static, built at deploy.
 *
 * Frontmatter: `title`, `tags`, `summary`. URLs are flat at `/support/<slug>` (organised by TAG, not
 * folder), so re-tagging never moves a page. Screenshots live in `public/support-assets/<slug>/`.
 */

const SUPPORT_DIR = path.join(process.cwd(), "content", "support");

export interface SupportDoc {
  /** Flat slug — the folder name and the URL segment. */
  slug: string;
  title: string;
  summary?: string;
  tags: string[];
  /** false = draft: still built and reachable by its direct URL, but delisted from the Help Center
   *  and search, left out of the sitemap, and served noindex. Default true. Set `published: false` in
   *  frontmatter to soft-publish a doc for QA before it goes live. */
  published: boolean;
  body: string;
}

function parseDoc(slug: string, raw: string): SupportDoc {
  const { data, content } = matter(raw);
  const tags = Array.isArray(data.tags)
    ? data.tags.map((t: unknown) => String(t).trim()).filter(Boolean)
    : [];
  const title = typeof data.title === "string" && data.title.trim() ? data.title.trim() : slug;
  const summary =
    typeof data.summary === "string" && data.summary.trim() ? data.summary.trim() : undefined;
  // A doc is published unless it explicitly opts out with `published: false` (soft-publish for QA).
  const published = data.published !== false;
  return { slug, title, summary, tags, published, body: content.trim() };
}

async function readAll(): Promise<SupportDoc[]> {
  let entries: import("node:fs").Dirent[];
  try {
    entries = await fs.readdir(SUPPORT_DIR, { withFileTypes: true });
  } catch {
    return [];
  }
  const docs: SupportDoc[] = [];
  for (const e of entries) {
    if (!e.isDirectory() || e.name.startsWith("_") || e.name.startsWith(".")) continue;
    let raw: string;
    try {
      raw = await fs.readFile(path.join(SUPPORT_DIR, e.name, "page.md"), "utf8");
    } catch {
      continue;
    }
    const doc = parseDoc(e.name, raw);
    if (!doc.body.trim()) continue;
    docs.push(doc);
  }
  return docs.sort((a, b) => a.title.localeCompare(b.title));
}

// Content is static (built into the repo), so cache the parse for the whole build/runtime.
let cached: Promise<SupportDoc[]> | null = null;

export function listSupportDocs(): Promise<SupportDoc[]> {
  return (cached ??= readAll());
}

export async function getSupportDoc(slug: string): Promise<SupportDoc | null> {
  return (await listSupportDocs()).find((d) => d.slug === slug) ?? null;
}

/** Published docs only — drafts (`published: false`) are excluded. Use for the landing list, search,
 *  tag counts, and the sitemap. The per-article page uses listSupportDocs/getSupportDoc so a draft is
 *  still built and reachable by its direct URL. */
export async function listPublishedSupportDocs(): Promise<SupportDoc[]> {
  return (await listSupportDocs()).filter((d) => d.published);
}

/**
 * Flatten a doc's markdown body into a normalized, lowercased plain-text blob for full-text search
 * (Grant's cutover requirement, 2026-09-15 — the landing search must match article text, not just the
 * title). Drops image syntax + data-URI noise and inline HTML, keeps link labels and code/command text
 * (users search for config keys and commands), strips markdown emphasis/heading/table markers, and
 * collapses whitespace. Precomputed server-side so the client filter stays a cheap substring check.
 */
export function toSearchText(body: string): string {
  return body
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // images (incl. data URIs) → drop
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links → keep the visible label
    .replace(/<[^>]+>/g, " ") // inline HTML tags
    .replace(/[#>*_~`]/g, " ") // md heading/emphasis/code markers
    .replace(/\|/g, " ") // table pipes
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** All tags in use, most-common first, for the landing page's category rail. */
export function tagsFrom(docs: SupportDoc[]): Array<{ tag: string; count: number }> {
  const counts = new Map<string, number>();
  for (const d of docs) for (const t of d.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}
