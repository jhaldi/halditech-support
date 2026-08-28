import Link from "next/link";
import { renderAuthored } from "@/lib/authored";
import type { SupportDoc } from "@/lib/support";

/** "Set each truck's Domicile" → "set-each-trucks-domicile". */
function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/&[a-z]+;/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Render the doc body to HTML: drop a redundant leading H1, id the H2s, collect a TOC, point images
 *  at the asset route. */
function renderBody(doc: SupportDoc): { html: string; toc: Array<{ id: string; text: string }> } {
  const body = doc.body.replace(/^\s*#\s+.*(?:\r?\n)+/, "");
  let html = renderAuthored(body);

  const toc: Array<{ id: string; text: string }> = [];
  const seen = new Set<string>();
  html = html.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/gi, (_m, attrs, inner) => {
    const text = inner.replace(/<[^>]+>/g, "").trim();
    let id = slugifyHeading(text) || `section-${toc.length + 1}`;
    while (seen.has(id)) id = `${id}-${toc.length + 1}`;
    seen.add(id);
    toc.push({ id, text });
    return `<h2 id="${id}"${attrs}>${inner}</h2>`;
  });

  // Screenshots are served statically from public/support-assets/<slug>/. Absolute to the zone origin
  // so they resolve when this app is served under halditech.com/support (multi-zone), not just standalone.
  html = html.replace(
    /(<img\b[^>]*\bsrc=")(img-[^"]+)"/gi,
    (_m, pre, file) => `${pre}https://halditech-support.vercel.app/support-assets/${doc.slug}/${file}"`,
  );

  return { html, toc };
}

export function SupportArticle({ doc }: { doc: SupportDoc }) {
  const { html, toc } = renderBody(doc);
  const eyebrow = doc.tags[0] ?? "Help";

  return (
    <div className="sup-wrap">
      <nav className="sup-crumbs" aria-label="Breadcrumb">
        <Link href="/support">Support</Link>
        <span className="sep">/</span>
        <span>{doc.title}</span>
      </nav>

      <div className="sup-shell">
        <article className="sup-article">
          <div className="sup-eyebrow">{eyebrow}</div>
          <h1>{doc.title}</h1>

          <div className="sup-meta">
            <div className="sup-tags">
              {doc.tags.map((t) => (
                <Link key={t} className="sup-chip" href={`/support?tag=${encodeURIComponent(t)}`}>
                  {t}
                </Link>
              ))}
            </div>
          </div>

          {doc.summary && <p className="sup-summary">{doc.summary}</p>}

          <div className="sup-body" dangerouslySetInnerHTML={{ __html: html }} />

          <div className="sup-needhelp">
            <span className="nh-ico" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </span>
            <div>
              <h3>Need help?</h3>
              <p>
                Email <a href="mailto:support@halditech.com">support@halditech.com</a> or call us at
                (470) 594-2534.
              </p>
            </div>
            <div className="nh-actions">
              <a className="sup-btn primary" href="mailto:support@halditech.com">Email support</a>
              <a className="sup-btn ghost" href="tel:+14705942534">Call us</a>
            </div>
          </div>

          <p style={{ marginTop: "26px" }}>
            <Link className="sup-backlink" href="/support">← Back to all help articles</Link>
          </p>
        </article>

        {toc.length > 1 && (
          <aside className="sup-aside" aria-label="On this page">
            <div className="sup-toc-label">On this page</div>
            <ul className="sup-toc">
              {toc.map((h) => (
                <li key={h.id}>
                  <a href={`#${h.id}`}>{h.text}</a>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </div>
  );
}
