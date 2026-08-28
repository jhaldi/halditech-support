# halditech-support

The **HaldiTech Support KB** — the **Support Track** of the content-authoring redesign (backlog **#546**, **Lane 2**).

- **Lane 2 (generated):** content is **Claude-generated markdown in this repo**, not team-authored. This is the
  deliberate reversal of #495 (the Drive-authored, team-editable KB) — support docs are Claude's to build/maintain.
- **Stack:** Next.js (App Router) + `marked` + `gray-matter`. Fully static — rebuilds on deploy, no runtime fetch.
- **Content:** `content/support/<slug>/page.md` (frontmatter `title`/`tags`/`summary`); assets in
  `public/support-assets/<slug>/`. URLs: `/support/<slug>`, organised by tag.
- **Deploy:** its own Vercel project; eventually served at `halditech.com/support` via a rewrite from `halditech-web`.
- **Provenance:** lifted 2026-08-28 from the website's `/support` implementation (`apps/website`), with the Drive
  backend removed. 59 articles migrated.

## Local dev
```bash
npm install
npm run dev   # http://localhost:3000/support
```

## Branch model
`integration` (push freely) → `staging` / `qa` (preview) → `main` (**production — John + Claude only**).
