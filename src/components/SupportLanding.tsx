"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

export interface LandingDoc {
  slug: string;
  title: string;
  summary?: string;
  tags: string[];
}

export function SupportLanding({
  docs,
  tags,
  initialTag,
}: {
  docs: LandingDoc[];
  tags: Array<{ tag: string; count: number }>;
  initialTag?: string;
}) {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(
    initialTag && tags.some((t) => t.tag === initialTag) ? initialTag : null,
  );

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("tag");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- URL-only state, applied post-hydration
    if (t && tags.some((x) => x.tag === t)) setActiveTag(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const q = query.trim().toLowerCase();

  const matches = useMemo(() => {
    return docs.filter((d) => {
      if (!q) return true;
      return (
        d.title.toLowerCase().includes(q) ||
        d.summary?.toLowerCase().includes(q) ||
        d.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [docs, q]);

  const groups = useMemo(() => {
    const visibleTags = activeTag ? tags.filter((t) => t.tag === activeTag) : tags;
    return visibleTags
      .map(({ tag }) => ({ tag, docs: matches.filter((d) => d.tags.includes(tag)) }))
      .filter((g) => g.docs.length > 0);
  }, [matches, tags, activeTag]);

  const totalShown = activeTag
    ? matches.filter((d) => d.tags.includes(activeTag)).length
    : matches.length;

  return (
    <div className="sup-wrap">
      <div className="sup-hero">
        <div className="sup-eyebrow">Help Center</div>
        <h1>How can we help?</h1>
        <p>Guides and answers for running HaldiTech — payroll, settlements, IVMRs, integrations, and the driver app.</p>
        <label className="sup-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            placeholder="Search help articles…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search help articles"
          />
        </label>
      </div>

      <div className="sup-filters" role="group" aria-label="Filter by topic">
        <button
          className="sup-filter"
          aria-pressed={activeTag === null}
          onClick={() => setActiveTag(null)}
        >
          All<span className="c">{docs.length}</span>
        </button>
        {tags.map(({ tag, count }) => (
          <button
            key={tag}
            className="sup-filter"
            aria-pressed={activeTag === tag}
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
          >
            {tag}
            <span className="c">{count}</span>
          </button>
        ))}
      </div>

      <p className="sup-count" style={{ padding: "6px 0 0" }}>
        {totalShown} article{totalShown === 1 ? "" : "s"}
        {activeTag ? ` in ${activeTag}` : ""}
        {q ? ` matching “${query}”` : ""}
      </p>

      {groups.length === 0 ? (
        <p className="sup-empty">No articles match that search. Try a different term, or email support@halditech.com.</p>
      ) : (
        groups.map((g) => (
          <section className="sup-group" key={g.tag}>
            <h2>
              {g.tag}
              <span className="c">
                {g.docs.length} article{g.docs.length === 1 ? "" : "s"}
              </span>
            </h2>
            <div className="sup-cards">
              {g.docs.map((d) => (
                <Link className="sup-card" key={d.slug} href={`/support/${d.slug}`}>
                  <h3>{d.title}</h3>
                  {d.summary && <p>{d.summary}</p>}
                  <div className="ct">
                    {d.tags.slice(0, 3).map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
