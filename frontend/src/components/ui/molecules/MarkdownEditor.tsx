import React, { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bold, Eye, FileCode, Italic, MessageSquarePlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/atoms/textarea';
import { countFootnotes, findFootnoteIssues, insertFootnote, wrapSelection } from '@/utils/markdown';
import { MarkdownContent } from './MarkdownContent';

type Mode = 'markdown' | 'preview';

interface MarkdownEditorProps {
  id?: string;
  value: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  /** Approximate visible height in text rows. */
  rows?: number;
  /** Applies the Tibetan webfont to both the source and the preview. */
  tibetan?: boolean;
  readOnly?: boolean;
  className?: string;
}

/**
 * Admin editor for Markdown content with inline footnotes.
 *
 * - **Markdown** tab: the stored source, footnotes included (`[^3]` in the
 *   text, `[^3]: note` below it). "Footnote" inserts the next free reference at
 *   the caret and an empty definition at the end, then puts the caret there.
 * - **Preview** tab: the same `MarkdownContent` the public reader uses, so what
 *   the admin sees is what readers get.
 */
export const MarkdownEditor = ({
  id,
  value,
  onChange,
  placeholder,
  rows = 6,
  tibetan = false,
  readOnly = false,
  className,
}: MarkdownEditorProps) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>('markdown');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const issues = useMemo(() => findFootnoteIssues(value || ''), [value]);
  const footnoteCount = useMemo(() => countFootnotes(value || ''), [value]);
  const minHeight = `${Math.max(rows, 3) * 1.75}rem`;

  /** Applies an edit, then restores focus and the caret/selection once React has re-rendered. */
  const applyEdit = (next: string, selStart: number, selEnd = selStart) => {
    onChange(next);
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(selStart, selEnd);
      if (selStart === next.length) el.scrollTop = el.scrollHeight;
    });
  };

  const handleWrap = (marker: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const r = wrapSelection(value, el.selectionStart, el.selectionEnd, marker);
    applyEdit(r.value, r.selectionStart, r.selectionEnd);
  };

  const handleFootnote = () => {
    const el = textareaRef.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    const r = insertFootnote(value, start, end);
    applyEdit(r.value, r.caret);
  };

  const tabClass = (active: boolean) =>
    cn(
      'inline-flex items-center gap-1.5 rounded-sm px-3 py-1 text-xs font-medium transition-colors',
      active ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
    );
  const toolClass =
    'inline-flex h-7 items-center gap-1 rounded px-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40';

  return (
    <div className={cn('rounded-md border border-input bg-background', readOnly && 'opacity-60', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-input px-2 py-1.5">
        <div className="inline-flex rounded-md bg-muted p-0.5" role="tablist">
          <button type="button" role="tab" aria-selected={mode === 'markdown'} className={tabClass(mode === 'markdown')} onClick={() => setMode('markdown')}>
            <FileCode className="h-3.5 w-3.5" />
            {t('markdownView')}
          </button>
          <button type="button" role="tab" aria-selected={mode === 'preview'} className={tabClass(mode === 'preview')} onClick={() => setMode('preview')}>
            <Eye className="h-3.5 w-3.5" />
            {t('preview')}
          </button>
        </div>

        {mode === 'markdown' && !readOnly && (
          <div className="flex items-center gap-0.5">
            <button type="button" className={toolClass} onClick={() => handleWrap('**')} title={t('bold')}>
              <Bold className="h-3.5 w-3.5" />
            </button>
            <button type="button" className={toolClass} onClick={() => handleWrap('*')} title={t('italic')}>
              <Italic className="h-3.5 w-3.5" />
            </button>
            <button type="button" className={toolClass} onClick={handleFootnote} title={t('addFootnoteHint')}>
              <MessageSquarePlus className="h-3.5 w-3.5" />
              {t('addFootnote')}
            </button>
          </div>
        )}
        {mode === 'preview' && footnoteCount > 0 && (
          <span className="text-xs text-muted-foreground">{t('footnotesCount', { count: footnoteCount })}</span>
        )}
      </div>

      {mode === 'markdown' ? (
        <Textarea
          id={id}
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          spellCheck={false}
          style={{ minHeight }}
          className={cn(
            'resize-y rounded-none border-0 font-mono text-sm leading-relaxed focus-visible:ring-0 focus-visible:ring-offset-0',
            tibetan && 'tibetan font-normal text-base'
          )}
        />
      ) : (
        <div className="overflow-auto px-3 py-2" style={{ minHeight }}>
          {value.trim() ? (
            <MarkdownContent value={value} tibetan={tibetan} className="text-base leading-relaxed" />
          ) : (
            <p className="text-sm italic text-muted-foreground">{t('nothingToPreview')}</p>
          )}
        </div>
      )}

      {(issues.missingDefinitions.length > 0 || issues.unusedDefinitions.length > 0) && (
        <div className="space-y-0.5 border-t border-input bg-amber-50 px-3 py-1.5 text-xs text-amber-800">
          {issues.missingDefinitions.length > 0 && (
            <p>{t('footnoteMissingDefinition', { labels: issues.missingDefinitions.map((l) => `[^${l}]`).join(', ') })}</p>
          )}
          {issues.unusedDefinitions.length > 0 && (
            <p>{t('footnoteUnusedDefinition', { labels: issues.unusedDefinitions.map((l) => `[^${l}]`).join(', ') })}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default MarkdownEditor;
