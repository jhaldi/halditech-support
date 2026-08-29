# AGENTS.md — rules for AI agents in this repo

This is the **HaldiTech Support KB** — the **Support Track** of the content-authoring redesign (backlog
**#546**, **Lane 2**). Unlike the landing/site surfaces, this content is **Claude-generated, not
team-authored**. There is no Lovable and no Drive backend here (that was #495, deliberately retired
2026-08-28 — support docs are not team-edited).

## Content
- One markdown file per article: `content/support/<slug>/page.md`, with frontmatter `title`, `tags`,
  `summary`. The slug (folder name) is the URL segment → `/support/<slug>`. Organised by **tag**, not
  folder, so re-tagging never moves a page.
- Screenshots: `public/support-assets/<slug>/img-N.png`, referenced in the body as `img-N.png`.
- To add/edit an article, write/generate the markdown file. The site is fully static (rebuilds on deploy).

## ⛔ Do not touch the wiring
`src/app/layout.tsx` contains the **GTM container** (`GTM-PTNGVBS`) inside `⛔ WIRING BLOCK` markers. GA4
fires inside GTM — never add a competing GA4 tag. Don't remove or duplicate the block.

## Branch model (canon `git-branch-standard.md`)
`integration` (work) → `staging` / `qa` (preview) → `main` (**production — John + Claude only**).

## Deploy target
Its own Vercel project; eventually served at **halditech.com/support** via a rewrite from `halditech-web`.
The 301 map from the old Freshdesk KB URLs is tracked in **#497**.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
