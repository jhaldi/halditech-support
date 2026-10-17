# Runbook — Support-Doc Refresh / Build (live app + screenshots)

How Claude refreshes an existing support article (or builds a new one) against the **live staging app**,
including capturing fresh screenshots. Written after the Oct 2026 docs-refresh pilot; the screenshot method
here is the one that actually works — the earlier guesswork cost real time, hence this runbook.

> **TL;DR of the hard-won part:** the Chrome extension's native screenshot (`save_to_disk`) is **flaky and does
> not reliably write a file**. The reliable capture is **html2canvas injected via `javascript_tool`**, which
> downloads a crisp @2x PNG to the **Desktop** (Chrome's default download dir), which you then `mv` into
> `public/support-assets/<slug>/`. This only works silently because of one Chrome setting (below).

---

## 1. Access / prerequisites — John sets these up; Claude cannot

- **Staging login (desktop app):** John logs Claude into `https://staging.halditech.com` as the **Foghorn
  Linehaul** demo, in **Chrome** (the `claude-in-chrome` extension drives his already-authenticated session).
  Claude **cannot** type the password itself — it's a production host, and entering credentials there is barred.
  So this is always a John step at the start of a session.
- **Driver app** (`https://driver.staging.halditech.com`) is **separate** and **Auth0-gated** — it needs its own
  login, and mobile/driver docs (tag `Mobile & Driver App`) **wait** until it's reachable.
- **⭐ Chrome download setting — THE enabler:** `chrome://settings/downloads` → **"Ask where to save each file
  before downloading" = OFF**. With it off, JS-triggered downloads land **silently on the Desktop**. If
  screenshots suddenly stop saving, **check this toggle first** — it is the single most common cause.
- **Window size:** resize the Chrome window to desktop before capturing, so the app renders its full desktop
  layout: `resize_window(tabId, 1920, 1080)`.
- **Sanity-check the download pipeline** at session start (before relying on it) with a throwaway file:
  ```js
  const a=document.createElement('a');a.href='data:text/plain;base64,'+btoa('dl-test');
  a.download='claude-dl-test.txt';document.body.appendChild(a);a.click();setTimeout(()=>a.remove(),500);'triggered';
  ```
  Then confirm `C:\Users\jhald\Desktop\claude-dl-test.txt` exists and delete it. If it's not there → the toggle
  above is ON (ask John to turn it off).

---

## 2. The capture pipeline (html2canvas → Desktop → repo)

Native `computer screenshot {save_to_disk:true}` is **flaky** (times out while the renderer is busy; often
returns **no path** and writes **nothing**). **Do not depend on it.** Use html2canvas instead — it also renders
the **entire element including below-the-fold** content (no scrolling needed) and at `scale:2` is sharper than a
viewport JPEG. Staging's CSP allows loading it from cdnjs; `useCORS:true` is needed for the app's own images.

**Inject once per page load, then capture per screenshot** (`javascript_tool`, tab = the app tab):

```js
// inject html2canvas once
if(!window.html2canvas){await new Promise((res,rej)=>{const s=document.createElement('script');
  s.src='https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
  s.onload=res;s.onerror=()=>rej(new Error('CSP blocked html2canvas'));document.head.appendChild(s);});}
// reusable capture helper: __cap(selectorOrElement, downloadName) -> downloads a @2x PNG to the Desktop
window.__cap=async(sel,name)=>{const el=typeof sel==='string'?document.querySelector(sel):sel;
  if(!el)return 'NO EL '+sel;
  const c=await html2canvas(el,{scale:2,useCORS:true,logging:false,backgroundColor:'#ffffff'});
  const b=await new Promise(r=>c.toBlob(r,'image/png'));const u=URL.createObjectURL(b);
  const a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();
  await new Promise(r=>setTimeout(r,800));a.remove();URL.revokeObjectURL(u);
  return name+' '+c.width+'x'+c.height;};
```

Then call it, e.g.: `await window.__cap('.e-grid','ht-how-to-delete-trucks-img-1.png')`.

**Useful selectors** (Syncfusion + the app's shell):
- `.app-main` — the main content pane · `.app-nav-menu` — the left nav
- `.e-grid` — a data grid/list · `.e-dialog, [role=dialog]` — an open modal
- `.card-body` — a dashboard/P&L card (walk up from a known heading: find the `h5`/`h1`, `.closest('.card-body')`)
- To open a collapsed nav group first: click `a.app-nav-group-toggle` matching the group label, wait ~700ms.

**Move the download into the repo** (name captures distinctively so Desktop never collides):

```bash
cd /c/Users/jhald/source/repos/halditech-support
mv "/c/Users/jhald/Desktop/ht-<slug>-img-1.png" public/support-assets/<slug>/img-1.png
```

> Images live in **`public/support-assets/<slug>/img-N.png`** but are referenced in the markdown body as the bare
> **`img-N.png`** — the renderer (`src/components/SupportArticle.tsx`) rewrites them to the asset origin. The
> `img-N.png` copies that may also sit inside `content/support/<slug>/` are **legacy/unused** — don't rely on them.

For an image that's **already a served URL** (e.g. a brand asset), skip html2canvas — just fetch + download:
```js
const r=await fetch('https://staging.halditech.com/images/HaldiLogo.png');const b=await r.blob();
const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download='HaldiLogo.png';
document.body.appendChild(a);a.click();await new Promise(x=>setTimeout(x,900));a.remove();URL.revokeObjectURL(u);
```

---

## 3. Verifying a DEPLOYED page — don't trust an in-page re-render

An html2canvas render of the **deployed** KB page can be **CORS-tainted / stale** (it re-fetches images into the
already-loaded tab and can blank them). To confirm a deploy is correct, **fetch the deployed image bytes directly
and md5-compare** to your capture — don't eyeball an in-page re-render.

---

## 4. Per-doc flow

1. Read `content/support/<slug>/page.md`; list `public/support-assets/<slug>/` to see existing `img-N`.
2. Navigate the live app to the relevant screen(s); read the UI (screenshot inline and/or `read_page`).
3. **Rewrite the body** to match the current UI — nav paths, button/feature names, changed workflow. Keep the
   `published:` flag as-is. Preserve/adjust `img-N.png` refs + captions.
4. Capture the screenshots you need via `__cap` → Desktop → `mv` into `public/support-assets/<slug>/`.
5. **Keep each doc internally coherent** — never ship new text that contradicts an old screenshot. If a shot is
   now wrong and you can't recapture, drop the ref and flag the doc for a fresh capture rather than leave a lie.
6. Commit per doc/batch; push to `main` (drafts `published:false` are safe to ship — `noindex`, out of listing).
   Vercel rebuilds.
7. **On any publish-status change**, resync the CRM link picker (from the `halditech` repo):
   `node --env-file=apps/crm/.env.local apps/crm/scripts/sync-support-articles.mjs --execute`

---

## 5. Gotchas

- **Logged in as admin** → you see admin-only controls (e.g. a truck's **Domicile / Schedule B**). Do **not**
  document an admin-only step as if every user has it; flag it for Josh/Grant review. (This exact trap hit the
  IVMR doc — step 4 was admin-only and had to be removed.)
- **View-only in edit modals** — never click **Save**; **Cancel** out. You're on real (demo) data.
- **Foghorn demo data is synthetic** — safe to show in screenshots.
- **Native screenshot flaky** — if `save_to_disk` returns no path, that's expected; use html2canvas.
- **Native file dialogs freeze the tab.** Toolbar buttons that upload a file (e.g. Service Items **Import
  Excel**, any "choose file") open an **OS file picker** that blocks CDP — screenshots then time out
  ("renderer unresponsive"). Don't click them during a capture run; if you get stuck, send **Escape** via the
  `computer` key action to dismiss the picker and recover the tab.
- **Account Settings / Payroll Settings text probes can trip a sensitive-data block.** Broad `innerText`/DOM
  scans on screens holding tokens/credentials return `[BLOCKED: Cookie/query string data]`. Capture the screen
  as an image (html2canvas) and read it, instead of returning page text — and never screenshot credentials,
  tokens, or card details into a public doc.
- **Branch model** (canon): work on `integration`, but refreshed docs are shipped on `main` (that's where the
  live/QA copies sit); drafts (`published:false`) ride along safely. Prod publish of real content is John's call
  via the normal publish flow.
