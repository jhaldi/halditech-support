import { marked } from "marked";

/**
 * Render an authored article body (markdown, HTML, or both) to HTML.
 * Lifted from the website's WEB-05 renderer — GFM on, no sanitising (the content is Claude-generated
 * and lives in this repo, so there is no untrusted author). Support Track (#546, Lane 2).
 */
marked.setOptions({ gfm: true, breaks: false });

export function renderAuthored(body: string): string {
  if (!body.trim()) return "";
  return marked.parse(body, { async: false });
}
