/**
 * Helpers for Markdown-authored content (text summary sections).
 *
 * Footnotes live inside the content itself using GFM footnote syntax, exactly
 * as in `backend/sample/2.json`:
 *
 *   ...text with a reference[^3] in it...
 *   [^3]: The note that belongs to reference 3.
 *
 * Rendering is done by `MarkdownContent` (react-markdown + remark-gfm); these
 * helpers only cover the bits that work on the raw string - inserting a new
 * footnote, spotting broken ones, and flattening to plain text for excerpts.
 */

/** `[^label]` not followed by `:` - i.e. a reference, not a definition. */
const FOOTNOTE_REF = /\[\^([^\]\s]+)\](?!:)/g;
/** `[^label]:` at the start of a line - a definition. */
const FOOTNOTE_DEF = /^\[\^([^\]\s]+)\]:/gm;

export interface FootnoteIssues {
  /** Referenced in the text but never defined - renders as literal `[^x]`. */
  missingDefinitions: string[];
  /** Defined but never referenced - silently dropped from the rendered list. */
  unusedDefinitions: string[];
}

export function findFootnoteIssues(markdown: string): FootnoteIssues {
  const refs = new Set(Array.from(markdown.matchAll(FOOTNOTE_REF), (m) => m[1]));
  const defs = new Set(Array.from(markdown.matchAll(FOOTNOTE_DEF), (m) => m[1]));
  return {
    missingDefinitions: [...refs].filter((label) => !defs.has(label)),
    unusedDefinitions: [...defs].filter((label) => !refs.has(label)),
  };
}

export function countFootnotes(markdown: string): number {
  return new Set(Array.from(markdown.matchAll(FOOTNOTE_DEF), (m) => m[1])).size;
}

/** Next free numeric label: one past the highest number already used as a ref or definition. */
export function nextFootnoteLabel(markdown: string): string {
  let max = 0;
  for (const m of markdown.matchAll(/\[\^(\d+)\]/g)) {
    max = Math.max(max, Number(m[1]));
  }
  return String(max + 1);
}

/**
 * Inserts a reference at `[selectionStart, selectionEnd)` - after the selected
 * phrase, if any - and appends an empty definition at the end of the text.
 * Returns the new text and the caret position inside the new definition, so the
 * editor can drop the admin straight into writing the note.
 */
export function insertFootnote(
  markdown: string,
  selectionStart: number,
  selectionEnd: number
): { value: string; caret: number } {
  const label = nextFootnoteLabel(markdown);
  const ref = `[^${label}]`;
  const withRef = markdown.slice(0, selectionEnd) + ref + markdown.slice(selectionEnd);

  const trimmed = withRef.replace(/\s+$/, '');
  const lastLine = trimmed.slice(trimmed.lastIndexOf('\n') + 1);
  // Keep a block of definitions together; separate it from body text with a blank line.
  const separator = /^\[\^[^\]\s]+\]:/.test(lastLine) ? '\n' : '\n\n';
  const definition = `[^${label}]: `;
  const value = trimmed + separator + definition;
  return { value, caret: value.length };
}

/** Wraps the selection in `marker` (e.g. `**` for bold). */
export function wrapSelection(
  markdown: string,
  selectionStart: number,
  selectionEnd: number,
  marker: string
): { value: string; selectionStart: number; selectionEnd: number } {
  const selected = markdown.slice(selectionStart, selectionEnd);
  const value =
    markdown.slice(0, selectionStart) + marker + selected + marker + markdown.slice(selectionEnd);
  return {
    value,
    selectionStart: selectionStart + marker.length,
    selectionEnd: selectionEnd + marker.length,
  };
}

/**
 * Text copied out of a JSON file (e.g. `backend/sample/2.json`) still carries
 * its escapes: line breaks arrive as the two characters `\` `n`. Footnote
 * definitions only work at the start of a line, so on one long line every
 * `[^3]: note` is ignored. When a value has escaped breaks but no real ones,
 * decode it the way JSON would; anything else is returned untouched.
 */
export function unescapeJsonText(text: string): string {
  if (!text || text.includes('\n') || !/\\n/.test(text)) return text;
  try {
    return JSON.parse(`"${text.replace(/(^|[^\\])"/g, '$1\\"')}"`);
  } catch {
    return text.replace(/\\r\\n|\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\"/g, '"');
  }
}

/** Flattens Markdown to plain text for card excerpts, search results and meta tags. */
export function markdownToPlain(markdown: string): string {
  return markdown
    .replace(/^\[\^[^\]\s]+\]:.*$/gm, '') // footnote definitions
    .replace(/\[\^[^\]\s]+\]/g, '') // footnote references
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1') // images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // links
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, '') // headings, quotes, list markers
    .replace(/(\*\*|__|~~|\*|`)(.+?)\1/g, '$2') // emphasis / code (single `_` left alone: it shows up in plain words)
    .replace(/\n{2,}/g, '\n')
    .trim();
}
