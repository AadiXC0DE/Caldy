'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface MarkdownNotePreviewProps {
  content: string;
  className?: string;
  onWikiLinkClick?: (title: string) => void;
}

function renderInlineTokens(
  text: string,
  onWikiLinkClick?: (title: string) => void,
): React.ReactNode[] {
  const parts = text.split(/(\[\[[^[\]]+\]\]|`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith('[[') && part.endsWith(']]')) {
      const title = part.slice(2, -2).trim();
      return (
        <button
          key={`${title}-${index}`}
          type="button"
          onClick={() => onWikiLinkClick?.(title)}
          className="inline-flex rounded bg-primary/10 px-1.5 py-0.5 text-primary transition-colors hover:bg-primary/15"
        >
          {title}
        </button>
      );
    }

    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }

    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
          {part.slice(1, -1)}
        </code>
      );
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

export function MarkdownNotePreview({
  content,
  className,
  onWikiLinkClick,
}: MarkdownNotePreviewProps) {
  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        blocks.push(
          <pre
            key={`code-${index}`}
            className="overflow-x-auto rounded-xl border bg-muted/60 p-4 font-mono text-xs"
          >
            <code>{codeBuffer.join('\n')}</code>
          </pre>,
        );
        codeBuffer = [];
      }

      inCodeBlock = !inCodeBlock;
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    if (!trimmed) {
      blocks.push(<div key={`space-${index}`} className="h-3" />);
      return;
    }

    if (trimmed.startsWith('# ')) {
      blocks.push(
        <h1 key={index} className="text-2xl font-bold tracking-tight">
          {renderInlineTokens(trimmed.slice(2), onWikiLinkClick)}
        </h1>,
      );
      return;
    }

    if (trimmed.startsWith('## ')) {
      blocks.push(
        <h2 key={index} className="text-xl font-semibold tracking-tight">
          {renderInlineTokens(trimmed.slice(3), onWikiLinkClick)}
        </h2>,
      );
      return;
    }

    if (trimmed.startsWith('### ')) {
      blocks.push(
        <h3 key={index} className="text-base font-semibold">
          {renderInlineTokens(trimmed.slice(4), onWikiLinkClick)}
        </h3>,
      );
      return;
    }

    if (trimmed.startsWith('- [ ] ') || trimmed.startsWith('- [x] ')) {
      const checked = trimmed.startsWith('- [x] ');
      blocks.push(
        <div key={index} className="flex items-start gap-2 text-sm">
          <span
            className={cn(
              'mt-0.5 flex size-4 items-center justify-center rounded border text-[10px]',
              checked ? 'border-primary bg-primary text-primary-foreground' : 'border-border',
            )}
          >
            {checked ? '✓' : ''}
          </span>
          <span className={checked ? 'text-muted-foreground line-through' : ''}>
            {renderInlineTokens(trimmed.slice(6), onWikiLinkClick)}
          </span>
        </div>,
      );
      return;
    }

    if (trimmed.startsWith('- ')) {
      blocks.push(
        <div key={index} className="flex items-start gap-2 text-sm">
          <span className="mt-1 size-1.5 rounded-full bg-primary/70" />
          <span>{renderInlineTokens(trimmed.slice(2), onWikiLinkClick)}</span>
        </div>,
      );
      return;
    }

    if (trimmed.startsWith('> ')) {
      blocks.push(
        <blockquote
          key={index}
          className="border-l-2 border-primary/30 pl-4 text-sm italic text-muted-foreground"
        >
          {renderInlineTokens(trimmed.slice(2), onWikiLinkClick)}
        </blockquote>,
      );
      return;
    }

    blocks.push(
      <p key={index} className="text-sm leading-6 text-foreground/90">
        {renderInlineTokens(line, onWikiLinkClick)}
      </p>,
    );
  });

  if (!blocks.length) {
    return (
      <div
        className={cn(
          'rounded-xl border border-dashed p-6 text-sm text-muted-foreground',
          className,
        )}
      >
        Nothing to preview yet. Start typing markdown, checklists, or wikilinks like
        <span className="mx-1 rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
          [[Project Brief]]
        </span>
        .
      </div>
    );
  }

  return <div className={cn('space-y-3', className)}>{blocks}</div>;
}
