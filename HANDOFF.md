# Handoff — the HaldiTech Support KB (for Josh + his Claude)

> **Who this is for:** Josh, and the Claude he points at this repo — assume that Claude has **never seen this
> project before**. This doc's job is to make it productive from a cold start without doing confident-but-wrong
> things. The *mechanics* live in `DOC-REFRESH-RUNBOOK.md`; this is the *map*.

---

## 1. What this is, and what your job is
The **HaldiTech Support KB** is the public Help Center at **halditech.com/support** — ~60 how-to articles. It is
**Claude-generated and Claude-maintained** markdown in this repo (`halditech-support`), deployed on Vercel.

Your (Claude's) job: **build and refresh these docs.** A human requests a doc or a fix, you produce a draft, a
human QAs it, then it publishes. **You are the writer, not the gatekeeper** — John deliberately stepped out of the
middle so this scales without him. He stays break-glass admin only.

## 2. The method — TWO reference inputs, and you need BOTH
This is the heart of it:

- **The `haldifcs` product code = what the app *should* do.** The .NET product source is the authoritative answer
  to how a feature actually works. You write *correct* steps from the code, not by guessing at the UI. **This also
  makes "flag, don't fake" possible:** the only way to tell an intentional workflow change from a *regression* is to
  compare the live UI against what the code intends. Without the code you'll quietly document bugs as features.
- **The live app via Foghorn (staging) = what the app *does* + the screenshots.** You inspect the real UI and
  capture images here.

**Rule: if the live UI doesn't match what the code says it should do, STOP and flag it** — do not write a doc around
a screen you can't explain. That judgment is the whole value; it's how the current punch list (§7) was found.

## 3. The factory loop
Someone who knows the app says *"I want a doc on X"* → you read the `haldifcs` code for how X works + inspect it live
in Foghorn + capture screenshots → draft (~15 min) → **human QA** → publish. Publish = push to `main` (Vercel
auto-deploys, and the CRM picker auto-resyncs — see §5). Drafts are soft-published (`published: false`): built and
reachable at their real URL with a "Draft preview" banner, but hidden from the Help Center.

## 4. How to do the work → the runbook is your bible
**`DOC-REFRESH-RUNBOOK.md`** has the hard-won mechanics — the screenshot pipeline (html2canvas → Desktop → `mv`;
native capture is flaky), the required Chrome settings, the Foghorn staging login, the capture gotchas (native file
dialogs freeze capture; sensitive screens are blocked). **Read it before your first doc.** Don't re-derive it — the
methods in there replaced ones that failed and cost real time.

## 5. Access (all provisioned as of 2026-10-22)
- **This repo** — Josh is a collaborator (push access → read/commit/publish). Authenticate as Josh (his own `gh`).
- **`haldifcs` codebase** — Josh has full access (the "what it should do" source).
- **Foghorn / staging login** — Josh has the creds; it's a human-assisted login each session (Claude can't type the
  staging password — production host). Driver app (`driver.staging.halditech.com`) is Auth0-gated and separate.
- **Vercel** — *not needed.* Publishing is git-push-to-`main` (auto-deploys under John's connection); Vercel access
  only buys build-log/rollback observability, which stays John's break-glass.
- **CRM picker resync** — **automated.** A GitHub Action (`.github/workflows/resync-picker.yml`) runs on every push
  to `main` that touches content and mirrors the published set into the CRM composer's doc picker (drafts are never
  offerable as a customer link). Nothing manual, no tie to any other repo. The Supabase creds live as repo secrets.

## 6. SEO & analytics — don't break these
- **Indexing is automatic and tied to publish state.** A published doc is crawlable, in `sitemap.ts`, and in the
  on-page JSON-LD; a **draft (`published: false`) is `noindex` + excluded from the sitemap**. So "unpublish" also
  means "de-index" — no separate step.
- **Only a real prod build is crawlable** (`IS_INDEXABLE = SITE_ENV === "prod"` in `src/lib/site.ts`); staging/preview
  are always `noindex`. Don't "fix" that.
- **The old Freshdesk KB URLs are already 301-redirected** to `/support/<slug>` (#497, done) — that was the
  load-bearing SEO migration; `freshdesk_id` is kept on every migrated doc. You don't need to touch redirects.
- **Analytics/GTM is wired and off-limits:** `src/app/layout.tsx` holds the GTM container (`GTM-PTNGVBS`) inside
  `⛔ WIRING BLOCK` markers; GA4 fires *inside* GTM. **Never add a competing GA4 tag or touch that block.**

## 7. Where we left off — content state + punch list
- **~29 docs refreshed to the current app and live;** ~6 more were already accurate.
- **~23 docs are NOT converted, each for a specific reason** (below). These are **not** "just not done yet" — they're
  blocked on a decision or a capture you can't get solo. **Start here, but don't brute-force them.**

Punch list (what's blocked and why):
- **4 mobile docs** (confirm-trips, add legs, add routes, add notes): the driver app's Actions menu no longer has
  these flows — **product decision for Josh** (retire, or find where it moved — *possible regression*).
- **4 settlement-detail docs** (broken-legs ×2, missing-fuel-supplements, retail-fuel): opening a settlement freezes
  capture + trips the sensitive-data block; tabs reorganized — **supervised capture needed.**
- **quarterly-totals:** the "Bulk Settlement Data" screen is gone from the nav — **confirm the new location/name.**
- **2 Fuel docs** (truckspy-fuel-card, rel-fuel-monitor): those screens aren't on Foghorn (REL may not be enabled) —
  **config confirm; John said skip for now.**
- **3 Account Settings docs** (auto-download-settlements, settlement-summary-email, payment-information):
  credentials/card/billing — **never screenshot; careful cropped capture only, if at all.**
- **5 external-portal docs** (EFS, Motive, TruckSpy, BambooHR, MileageReports-key): third-party screens — **mostly
  still valid.**
- **importing-fleetio:** the "Import Excel" button opens a native OS dialog that freezes capture.
- **driver-messages:** it's actually the desktop driver-reports feature; screenshots still pending.

## 8. Known traps (the scar tissue)
- **Flag, don't fake** (see §2) — the #1 rule.
- **Never screenshot credentials / card / billing screens.**
- **Some screens just can't be captured on Foghorn** (settlement freeze, native dialogs, features not enabled there)
  — these need a supervised/credentialed session, not a workaround.
- **Driver-app docs need a separate Auth0 login** and wait until that staging is reachable.

## 9. Who decides what
- **Josh** — product calls (regression vs. intended change?) + QA sign-off.
- **Grant** — review.
- **John** — break-glass admin only. Route product/QA questions to Josh/Grant, *not* John — that's the point.

## 10. How to start (self-guided — there is no walkthrough)
This doc + `DOC-REFRESH-RUNBOOK.md` are the complete transfer; nobody is going to walk you through it. Start like
this:
1. **Prove the pipeline works first.** Have Josh log you into Foghorn (per the runbook), do the Chrome download
   sanity-check, and capture one throwaway screenshot end-to-end. Fix any setup issue (usually the "ask where to
   save" toggle) before doing real work.
2. **Do one real doc, solo.** Take a fresh request from Josh, or pick a *product-decision* punch-list item (not a
   capture-blocked one) and ask Josh the decision. Run the full loop: read the `haldifcs` code for the real
   behavior → inspect it live in Foghorn → capture screenshots → write the draft as `published: false`.
3. **Send the draft URL to Josh for QA** (it's live at `/support/<slug>` with a Draft-preview banner). On his OK,
   set `published: true` and push to `main` — it deploys and the picker auto-resyncs.
4. **When something's off** (UI doesn't match the code, a screen won't capture, a workflow looks changed): **flag it
   to Josh, don't fake it.** That's the whole job.

**Who to ask:** Josh (product calls + QA), Grant (review), John (break-glass only).
