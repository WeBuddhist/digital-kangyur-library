import React, { useCallback, useId, useMemo } from 'react';
import Markdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { isHtmlContent } from '@/utils/richText';
import { markdownToPlain, unescapeJsonText } from '@/utils/markdown';
import { RichTextContent } from './RichTextContent';

interface MarkdownContentProps {
  /** Stored content: Markdown with inline `[^n]` footnotes, legacy plain text, or legacy Quill HTML. */
  value: string | null | undefined;
  /** Applies the Tibetan webfont. */
  tibetan?: boolean;
  className?: string;
}

/** Collects `[^label]: note` lines so a reference can show its note on hover. */
function collectFootnoteNotes(markdown: string): Map<string, string> {
  const notes = new Map<string, string>();
  for (const m of markdown.matchAll(/^\[\^([^\]\s]+)\]:\s*(.*)$/gm)) {
    notes.set(m[1], markdownToPlain(m[2]));
  }
  return notes;
}

/**
 * Renders Markdown content with GFM footnotes: each `[^n]` becomes a numbered
 * superscript link, and the `[^n]: ...` definitions are gathered into a
 * footnote list at the end, with back-links to where they were referenced.
 *
 * Raw HTML inside the Markdown is not interpreted (react-markdown escapes it),
 * so nothing stored here can execute. Values that are already HTML - written by
 * the old Quill editor - are handed to `RichTextContent` unchanged.
 */
export const MarkdownContent = ({ value: rawValue, tibetan = false, className }: MarkdownContentProps) => {
  // Content pasted from a JSON file may hold `\n` escapes instead of line breaks.
  const value = useMemo(() => unescapeJsonText(rawValue || ''), [rawValue]);
  const { t } = useTranslation();
  // Several sections on one page can each use `[^3]`; a per-instance prefix
  // keeps their element ids (and therefore the jump links) apart.
  const prefix = `md${useId().replace(/[^a-zA-Z0-9]/g, '')}-`;

  const notes = useMemo(() => collectFootnoteNotes(value), [value]);

  const components = useMemo<Components>(
    () => ({
      a: ({ node, href, children, ...props }) => {
        const isFootnoteRef = (props as Record<string, unknown>)['data-footnote-ref'] !== undefined;
        const label = isFootnoteRef ? href?.split(`${prefix}fn-`)[1] : undefined;
        const external = !!href && /^https?:/i.test(href);
        return (
          <a
            href={href}
            title={label ? notes.get(decodeURIComponent(label)) : undefined}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            {...props}
          >
            {children}
          </a>
        );
      },
    }),
    [notes, prefix]
  );

  /**
   * Footnote links are in-page anchors. Letting the browser follow them would
   * push a `#...` entry onto the router history and jump the whole window, which
   * misses when the text sits in its own scroll container - so scroll the target
   * into view directly instead.
   */
  const handleClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const anchor = (event.target as HTMLElement).closest('a');
    const href = anchor?.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    const target = document.getElementById(decodeURIComponent(href.slice(1)));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    target.classList.add('markdown-footnote-flash');
    window.setTimeout(() => target.classList.remove('markdown-footnote-flash'), 1200);
  }, []);

  if (!value || !value.trim()) return null;

  if (isHtmlContent(value)) {
    return <RichTextContent value={value} tibetan={tibetan} className={className} />;
  }

  return (
    <div
      className={cn('markdown-content', tibetan && 'tibetan', className)}
      onClick={handleClick}
    >
      <Markdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        remarkRehypeOptions={{
          clobberPrefix: prefix,
          footnoteLabel: t('footnotes'),
          footnoteLabelTagName: 'h4',
          // Word shows no heading above its footnotes, just a short rule.
          footnoteLabelProperties: { className: ['sr-only'] },
          footnoteBackLabel: t('backToContent'),
        }}
        components={components}
      >
        {value}
      </Markdown>
    </div>
  );
};

export default MarkdownContent;
