'use client';

import React, { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Calendar,
  CheckSquare,
  Command,
  FileText,
  Flame,
  Layers3,
  Search,
  Sparkles,
  StickyNote,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const OPEN_EVENT = 'caldy:open-command-palette';

const TYPE_META = {
  event: { label: 'Event', icon: Calendar },
  'imported-event': { label: 'Imported', icon: Calendar },
  task: { label: 'Task', icon: CheckSquare },
  festival: { label: 'Holiday', icon: Sparkles },
  note: { label: 'Note', icon: StickyNote },
  habit: { label: 'Habit', icon: Flame },
  'task-view': { label: 'View', icon: Layers3 },
  'calendar-source': { label: 'Calendar', icon: Bell },
  'mail-thread': { label: 'Inbox', icon: FileText },
  command: { label: 'Command', icon: Command },
} as const;

const GROUPS = [
  { key: 'command', title: 'Actions' },
  { key: 'task', title: 'Tasks' },
  { key: 'event', title: 'Calendar' },
  { key: 'imported-event', title: 'Imported Calendars' },
  { key: 'note', title: 'Notes' },
  { key: 'habit', title: 'Habits' },
  { key: 'task-view', title: 'Saved Views' },
  { key: 'calendar-source', title: 'Calendar Sources' },
] as const;

const TYPE_ORDER: Record<string, number> = {
  command: 0,
  task: 1,
  event: 2,
  note: 3,
  habit: 4,
  'task-view': 5,
  'imported-event': 6,
  'calendar-source': 7,
  festival: 8,
  'mail-thread': 9,
};

function sanitizePreview(value?: string | null) {
  if (!value) return '';

  return value
    .replace(/\[\[([^[\]]+)\]\]/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/[*_~`>|-]/g, ' ')
    .replace(/\[(x| )\]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildPreview(value?: string | null) {
  return sanitizePreview(value).slice(0, 140);
}

export function SearchBar() {
  const router = useRouter();
  const { searchDocuments } = useApp();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  useEffect(() => {
    const openPalette = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, openPalette);
    return () => window.removeEventListener(OPEN_EVENT, openPalette);
  }, []);

  const results = useMemo(() => {
    if (!deferredQuery) {
      return [...searchDocuments]
        .sort((left, right) => {
          const priorityDelta = (TYPE_ORDER[left.type] ?? 99) - (TYPE_ORDER[right.type] ?? 99);
          if (priorityDelta !== 0) return priorityDelta;
          return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
        })
        .slice(0, 18);
    }

    const terms = deferredQuery.split(/\s+/).filter(Boolean);

    return searchDocuments
      .map((document) => {
        const haystack = [
          document.title,
          document.body || '',
          document.section || '',
          ...(document.keywords || []),
        ]
          .join(' ')
          .toLowerCase();

        const score = terms.reduce((total, term) => {
          if (document.title.toLowerCase().startsWith(term)) return total + 8;
          if (document.title.toLowerCase().includes(term)) return total + 5;
          if ((document.section || '').toLowerCase().includes(term)) return total + 3;
          if (haystack.includes(term)) return total + 2;
          return total;
        }, 0);

        return { document, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((left, right) => {
        if (right.score !== left.score) return right.score - left.score;
        return (
          new Date(right.document.updatedAt).getTime() - new Date(left.document.updatedAt).getTime()
        );
      })
      .slice(0, 24)
      .map((entry) => entry.document);
  }, [deferredQuery, searchDocuments]);

  const groupedResults = useMemo(
    () =>
      GROUPS.map((group) => ({
        ...group,
        items: results.filter((document) => document.type === group.key).slice(0, 6),
      })).filter((group) => group.items.length > 0),
    [results],
  );

  const totalResultCount = results.length;
  const resultLabel = deferredQuery
    ? `${totalResultCount} result${totalResultCount === 1 ? '' : 's'}`
    : 'Jump back in quickly';

  const handleSelect = (url: string) => {
    startTransition(() => {
      router.push(url);
      setOpen(false);
      setQuery('');
    });
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="h-10 w-full justify-between rounded-2xl border-border/70 bg-card/80 px-3 text-sm text-muted-foreground shadow-sm transition hover:border-border hover:bg-card md:min-w-[260px]"
      >
        <span className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          Search everything
        </span>
        <span className="hidden items-center gap-1 rounded-full border bg-background px-2 py-0.5 text-[11px] font-medium text-foreground/70 sm:inline-flex">
          <Command className="h-3 w-3" />K
        </span>
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search everything"
        description="Search across tasks, notes, calendars, habits, and product actions."
        contentClassName="max-w-[min(760px,calc(100vw-1.5rem))] overflow-hidden rounded-[24px] border border-border/80 bg-background/95 p-0 shadow-[0_28px_90px_-42px_rgba(0,0,0,0.65)] backdrop-blur-xl"
      >
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder="Search tasks, notes, calendar links, habits, and actions"
          wrapperClassName="h-14 border-b border-border/70 bg-background/95 px-4"
          className="h-12 text-base tracking-[-0.01em] placeholder:text-muted-foreground/70"
        />

        <div className="border-b border-border/60 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground/80">
          {resultLabel}
        </div>

        <CommandList className="max-h-[68vh] px-3 py-3">
          <CommandEmpty className="py-12 text-center text-sm text-muted-foreground">
            No matches for this query.
          </CommandEmpty>
          {groupedResults.map((group, groupIndex) => (
            <React.Fragment key={group.key}>
              {groupIndex > 0 && <CommandSeparator className="my-3" />}
              <CommandGroup
                heading={group.title}
                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-2 [&_[cmdk-group-heading]]:pt-1 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.18em] [&_[cmdk-group-heading]]:text-muted-foreground/80"
              >
                <div className="space-y-2">
                  {group.items.map((item) => {
                    const meta = TYPE_META[item.type] || { label: 'Item', icon: FileText };
                    const Icon = meta.icon;
                    const preview = buildPreview(item.body);

                    return (
                      <CommandItem
                        key={item.id}
                        value={`${item.title} ${item.body || ''} ${(item.keywords || []).join(' ')}`}
                        onSelect={() => handleSelect(item.url)}
                        className="group rounded-2xl border border-transparent px-3 py-3 transition-colors hover:bg-card/55 data-[selected=true]:border-border/70 data-[selected=true]:bg-card/70"
                      >
                        <div className="flex w-full items-start gap-3">
                          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-background text-foreground/80">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="truncate text-sm font-medium text-foreground">
                                {item.title}
                              </span>
                              <Badge
                                variant="outline"
                                className="rounded-full border-border/70 bg-transparent px-2 py-0 text-[10px] uppercase tracking-[0.14em] text-muted-foreground"
                              >
                                {meta.label}
                              </Badge>
                            </div>
                            {preview ? (
                              <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                                {preview}
                              </p>
                            ) : null}
                            {item.section ? (
                              <p className="mt-1.5 text-[11px] text-muted-foreground/80">
                                {item.section}
                              </p>
                            ) : null}
                          </div>
                          {item.type === 'command' ? (
                            <CommandShortcut className="rounded-full border border-border/70 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                              Run
                            </CommandShortcut>
                          ) : null}
                        </div>
                      </CommandItem>
                    );
                  })}
                </div>
              </CommandGroup>
            </React.Fragment>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}

export function openCommandPalette() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}
