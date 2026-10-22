// sync-support-articles.mjs — keep the CRM composer's doc picker (public.support_articles) in sync with the
// PUBLISHED set of THIS KB. A doc with `published: false` in frontmatter is a draft and must NOT be offerable
// as a link in a customer reply (John, 2026-10-15).
//
// Self-contained: reads ./content/support/<slug>/page.md from THIS repo and talks to Supabase over its REST
// API with `fetch` — no npm dependency, no build. Runs on bare Node (18+). This replaces the old manual step
// that ran from the `halditech` repo; the GitHub Action (.github/workflows/resync-picker.yml) runs it on every
// push to `main` that touches content, so publishing a doc auto-syncs the picker.
//
//   node scripts/sync-support-articles.mjs            # DRY RUN (default) — prints the plan, writes nothing
//   node scripts/sync-support-articles.mjs --execute  # apply
//
// Env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (GitHub Actions secrets).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KB_DIR = path.resolve(__dirname, "../content/support");
const SITE = "https://halditech.com/support";
const EXECUTE = process.argv.includes("--execute");

// Original hit-order ranks from CRM migration 0042's seed — restores a doc's picker position when it's
// re-published after a stint as a draft, so refreshing a doc doesn't reshuffle the list.
const SEED_RANK = {
  "how-to-set-up-ivmrs": 1, "motive-integration-connect-to-motive": 2, "driver-app-getting-started": 3,
  "how-to-integrate-with-truckspy": 4, "getting-efs-fuel-card-data-into-halditech": 5,
  "how-to-import-settlements": 6, "mobile-app-integration-for-driver": 7,
  "how-to-get-payroll-numbers-into-haldi-tech-pandl": 8, "how-to-download-csv-settlement-files-from-mygroundbiz": 9,
  "per-diems": 10, "how-to-reset-your-password": 11, "missing-fuel-supplements": 12,
  "how-to-find-missing-fuel-supplements": 13, "how-to-view-net-revenue-after-fuel": 14,
  "how-to-add-notes-in-the-mobile-app": 15, "how-to-set-up-a-new-user": 16, "regions-and-location": 17,
  "importing-fleetio-maintenance-records": 18, "how-to-delete-trucks": 19, "settlement-summary-email": 20,
};

function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const fm = m ? m[1] : "";
  const title = (fm.match(/^title:\s*(.+)$/m)?.[1] ?? "").trim().replace(/^["']|["']$/g, "");
  const publishedRaw = fm.match(/^published:\s*(.+)$/m)?.[1]?.trim().toLowerCase();
  const published = publishedRaw !== "false"; // default published unless explicitly false
  return { title, published };
}

function readKb() {
  const out = [];
  for (const slug of fs.readdirSync(KB_DIR)) {
    if (slug.startsWith("_") || slug.startsWith(".")) continue;
    const file = path.join(KB_DIR, slug, "page.md");
    if (!fs.existsSync(file)) continue;
    const { title, published } = parseFrontmatter(fs.readFileSync(file, "utf8"));
    if (!title) continue;
    out.push({ slug, title, published, url: `${SITE}/${slug}` });
  }
  return out;
}

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SB_URL || !SB_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}
const H = { apikey: SB_KEY, authorization: `Bearer ${SB_KEY}`, "content-type": "application/json" };
const REST = `${SB_URL.replace(/\/$/, "")}/rest/v1/support_articles`;

async function sbGet() {
  const r = await fetch(`${REST}?select=slug,title,url,rank`, { headers: H });
  if (!r.ok) throw new Error(`read support_articles ${r.status}: ${await r.text()}`);
  return r.json();
}
async function sbDelete(slugs) {
  const list = slugs.map((s) => `"${s}"`).join(",");
  const r = await fetch(`${REST}?slug=in.(${encodeURIComponent(list)})`, { method: "DELETE", headers: H });
  if (!r.ok) throw new Error(`delete ${r.status}: ${await r.text()}`);
}
async function sbUpsert(rows) {
  const r = await fetch(`${REST}?on_conflict=slug`, {
    method: "POST",
    headers: { ...H, prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(rows),
  });
  if (!r.ok) throw new Error(`upsert ${r.status}: ${await r.text()}`);
}

const kb = readKb();
const published = kb.filter((d) => d.published);
const draft = kb.filter((d) => !d.published);
const kbSlugs = new Set(kb.map((d) => d.slug));

const rows = await sbGet();
const current = new Map(rows.map((r) => [r.slug, r]));
let maxRank = rows.reduce((m, r) => Math.max(m, r.rank ?? 0), 0);

// DELETE: rows that are drafts OR no longer in the KB
const toDelete = rows
  .filter((r) => !kbSlugs.has(r.slug) || draft.some((d) => d.slug === r.slug))
  .map((r) => r.slug);
// UPSERT: every published doc (restore/keep title, url, rank)
const toUpsert = published.map((d) => ({
  slug: d.slug, title: d.title, url: d.url,
  rank: current.get(d.slug)?.rank ?? SEED_RANK[d.slug] ?? ++maxRank,
}));

console.log(`KB: ${kb.length} docs (${published.length} published, ${draft.length} draft). Table: ${rows.length} rows.`);
if (draft.length) console.log(`Drafts (excluded): ${draft.map((d) => d.slug).join(", ")}`);
console.log(`Will DELETE ${toDelete.length}: ${toDelete.join(", ") || "(none)"}`);
console.log(`Will UPSERT ${toUpsert.length} published rows (title/url/rank).`);

if (!EXECUTE) {
  console.log("\nDRY RUN — nothing written. Re-run with --execute to apply.");
} else {
  if (toDelete.length) await sbDelete(toDelete);
  await sbUpsert(toUpsert);
  console.log(`\nDONE. Deleted ${toDelete.length}, upserted ${toUpsert.length}. Picker now mirrors the published KB.`);
}
