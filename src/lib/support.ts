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
  return { slug, title, summary, tags, body: content.trim() };
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

/** All tags in use, most-common first, for the landing page's category rail. */
export function tagsFrom(docs: SupportDoc[]): Array<{ tag: string; count: number }> {
  const counts = new Map<string, number>();
  for (const d of docs) for (const t of d.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}
