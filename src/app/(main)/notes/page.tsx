'use client';

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Archive,
  CalendarDays,
  FileText,
  FolderKanban,
  Link2,
  Pin,
  PinOff,
  Plus,
  Search,
  Sparkles,
  StickyNote,
  Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
import { useApp } from '@/contexts/AppContext';
import { buildDailyNoteTitle, findBacklinks, formatDailyNoteDate } from '@/lib/notes';
import type { Note } from '@/lib/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MarkdownNotePreview } from '@/components/notes/MarkdownNotePreview';

const NOTE_SWATCHES = ['#f5f1e8', '#ecf3ff', '#eef7ed', '#fff1e5', '#f7ecff'];

const DEFAULT_NOTE_CONTENT = '';

function sortNotes(notes: Note[]) {
  return [...notes].sort((left, right) => {
    if (left.pinned && !right.pinned) return -1;
    if (!left.pinned && right.pinned) return 1;
    return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
  });
}

function buildDefaultNote(overrides: Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>> = {}) {
  return {
    title: 'Untitled note',
    content: DEFAULT_NOTE_CONTENT,
    color: NOTE_SWATCHES[0],
    pinned: false,
    folder: 'Workspace',
    tags: [],
    isTemplate: false,
    isDailyNote: false,
    dailyNoteDate: undefined,
    linkedNoteTitles: [],
    linkedTaskIds: [],
    linkedEventIds: [],
    ...overrides,
  };
}

function getExcerpt(content: string) {
  return content
    .replace(/[#>*`\-\[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);
}

function NotesPageClient() {
  const {
    notes,
    addNote,
    updateNote,
    deleteNote,
    toggleNotePin,
    archiveNote,
    restoreNote,
    tasks,
    events,
  } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<'write' | 'preview'>('write');
  const [showArchived, setShowArchived] = useState(false);
  const quickCreateHandledRef = useRef(false);

  const noteParam = searchParams.get('note');
  const newItem = searchParams.get('new');

  const visibleNotes = useMemo(
    () => notes.filter((note) => (showArchived ? Boolean(note.archivedAt) : !note.archivedAt)),
    [notes, showArchived],
  );

  const folders = useMemo(() => {
    const folderList = Array.from(
      new Set(visibleNotes.map((note) => note.folder || 'Workspace')),
    ).sort();
    return ['all', ...folderList];
  }, [visibleNotes]);

  const tags = useMemo(() => {
    const tagList = Array.from(new Set(visibleNotes.flatMap((note) => note.tags || []))).sort();
    return ['all', ...tagList];
  }, [visibleNotes]);

  const filteredNotes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return sortNotes(visibleNotes).filter((note) => {
      const matchesFolder =
        selectedFolder === 'all' || (note.folder || 'Workspace') === selectedFolder;
      const matchesTag = selectedTag === 'all' || (note.tags || []).includes(selectedTag);
      const matchesQuery =
        !query ||
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        (note.folder || '').toLowerCase().includes(query) ||
        (note.tags || []).some((tag) => tag.toLowerCase().includes(query));

      return matchesFolder && matchesTag && matchesQuery;
    });
  }, [searchQuery, selectedFolder, selectedTag, visibleNotes]);

  const selectedNote =
    visibleNotes.find((note) => note.id === selectedNoteId) || filteredNotes[0] || null;

  useEffect(() => {
    if (noteParam) {
      setSelectedNoteId(noteParam);
    }
  }, [noteParam]);

  useEffect(() => {
    if (newItem === 'note' && !quickCreateHandledRef.current) {
      quickCreateHandledRef.current = true;
      const noteId = addNote(buildDefaultNote());
      setSelectedNoteId(noteId);
      setEditorMode('write');
      router.replace('/notes');
      return;
    }

    if (newItem !== 'note') {
      quickCreateHandledRef.current = false;
    }
  }, [addNote, newItem, router]);

  useEffect(() => {
    if (!filteredNotes.length) {
      setSelectedNoteId(null);
      return;
    }

    if (!selectedNoteId || !visibleNotes.some((note) => note.id === selectedNoteId)) {
      setSelectedNoteId(filteredNotes[0].id);
    }
  }, [filteredNotes, selectedNoteId, visibleNotes]);

  const templates = useMemo(
    () => sortNotes(visibleNotes.filter((note) => note.isTemplate)),
    [visibleNotes],
  );
  const selectedBacklinks = useMemo(
    () => (selectedNote ? findBacklinks(selectedNote, notes) : []),
    [notes, selectedNote],
  );

  const createNote = (overrides: Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>> = {}) => {
    const noteId = addNote(
      buildDefaultNote({
        folder: selectedFolder === 'all' ? 'Workspace' : selectedFolder,
        tags: selectedTag === 'all' ? [] : [selectedTag],
        ...overrides,
      }),
    );
    setSelectedNoteId(noteId);
    setEditorMode('write');
    setShowArchived(false);
  };

  const createDailyNote = () => {
    const dailyNoteDate = formatDailyNoteDate(new Date());
    const existing = notes.find((note) => note.dailyNoteDate === dailyNoteDate);

    if (existing) {
      setShowArchived(false);
      setSelectedNoteId(existing.id);
      return;
    }

    createNote({
      title: buildDailyNoteTitle(new Date()),
      folder: 'Daily Notes',
      isDailyNote: true,
      dailyNoteDate,
      color: NOTE_SWATCHES[1],
      content: `# ${buildDailyNoteTitle(new Date())}

## Priorities
- [ ] 

## Notes

## Wins
- `,
    });
  };

  const createFromTemplate = (template: Note) => {
    createNote({
      title: `${template.title} copy`,
      content: template.content,
      color: template.color,
      folder: template.folder || 'Workspace',
      tags: template.tags || [],
      linkedTaskIds: template.linkedTaskIds || [],
      linkedEventIds: template.linkedEventIds || [],
    });
  };

  const updateSelectedNote = (updates: Partial<Note>) => {
    if (!selectedNote) return;
    updateNote(selectedNote.id, updates);
  };

  const openOrCreateLinkedNote = (title: string) => {
    const existing = notes.find((note) => note.title.toLowerCase() === title.toLowerCase());
    if (existing) {
      setShowArchived(false);
      setSelectedNoteId(existing.id);
      return;
    }

    createNote({
      title,
      content: `# ${title}\n\nLinked from [[${selectedNote?.title || 'Workspace'}]]\n`,
      folder: selectedNote?.folder || 'Workspace',
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notes"
        description="A calmer local-first writing space for thought, planning, daily notes, and linked context. Browse lightly, write deeply, and keep metadata tucked into one inspector."
        actions={
          <>
            <Button variant="outline" onClick={createDailyNote} className="rounded-2xl">
              <Sparkles className="mr-2 h-4 w-4" />
              Daily note
            </Button>
            <Button onClick={() => createNote()} className="rounded-2xl">
              <Plus className="mr-2 h-4 w-4" />
              New note
            </Button>
          </>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[240px_minmax(0,1.65fr)_250px]">
        <Card className="overflow-hidden rounded-[1.75rem] border-border/70 shadow-sm">
          <div className="border-b border-border/70 px-4 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search notes"
                className="rounded-2xl pl-9"
              />
            </div>
            <div className="mt-3 grid gap-2">
              <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                <SelectTrigger className="rounded-2xl">
                  <SelectValue placeholder="All notebooks" />
                </SelectTrigger>
                <SelectContent>
                  {folders.map((folder) => (
                    <SelectItem key={folder} value={folder}>
                      {folder === 'all' ? 'All notebooks' : folder}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger className="rounded-2xl">
                  <SelectValue placeholder="All tags" />
                </SelectTrigger>
                <SelectContent>
                  {tags.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag === 'all' ? 'All tags' : `#${tag}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                {filteredNotes.length} shown
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowArchived((value) => !value)}
                className="h-8 rounded-full px-3 text-xs"
              >
                {showArchived ? 'Show active' : 'Show archived'}
              </Button>
            </div>
          </div>

          <CardContent className="max-h-[72vh] space-y-3 overflow-y-auto p-3">
            {filteredNotes.length ? (
              filteredNotes.map((note) => (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => setSelectedNoteId(note.id)}
                  className={`w-full rounded-[1.35rem] border px-4 py-3 text-left transition-colors ${
                    selectedNote?.id === note.id
                      ? 'border-primary/35 bg-primary/8'
                      : 'hover:bg-muted/35'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium">{note.title}</p>
                        {note.isTemplate ? <Badge variant="outline">Template</Badge> : null}
                        {note.isDailyNote ? <Badge variant="secondary">Daily</Badge> : null}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {note.folder || 'Workspace'} · {format(new Date(note.updatedAt), 'MMM d')}
                      </p>
                    </div>
                    {note.pinned ? <Pin className="mt-0.5 h-4 w-4 text-primary" /> : null}
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {getExcerpt(note.content) || 'No body text yet.'}
                  </p>
                </button>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                No notes match this view yet.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-[1.75rem] border-border/70 shadow-sm">
          {selectedNote ? (
            <div className="flex min-h-[72vh] flex-col">
              <div className="border-b border-border/70 px-5 py-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <Input
                      value={selectedNote.title}
                      onChange={(event) => updateSelectedNote({ title: event.target.value })}
                      placeholder="Note title"
                      className="h-12 rounded-2xl border-0 bg-transparent px-0 text-2xl font-semibold shadow-none focus-visible:ring-0"
                    />
                    <p className="text-sm text-muted-foreground">
                      {selectedNote.folder || 'Workspace'} · Updated{' '}
                      {format(new Date(selectedNote.updatedAt), 'PPP')}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={editorMode === 'write' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setEditorMode('write')}
                      className="rounded-2xl"
                    >
                      Write
                    </Button>
                    <Button
                      variant={editorMode === 'preview' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setEditorMode('preview')}
                      className="rounded-2xl"
                    >
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleNotePin(selectedNote.id)}
                      className="rounded-2xl"
                    >
                      {selectedNote.pinned ? (
                        <>
                          <PinOff className="mr-2 h-4 w-4" />
                          Unpin
                        </>
                      ) : (
                        <>
                          <Pin className="mr-2 h-4 w-4" />
                          Pin
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div
                className="flex-1 px-5 py-5"
                style={{
                  background: `linear-gradient(180deg, ${selectedNote.color}35 0%, transparent 28%)`,
                }}
              >
                {editorMode === 'write' ? (
                  <Textarea
                    value={selectedNote.content}
                    onChange={(event) => updateSelectedNote({ content: event.target.value })}
                    className="min-h-[58vh] resize-none rounded-[1.8rem] border-border/70 bg-background/88 p-5 font-mono text-[15px] leading-7 shadow-sm"
                    placeholder="Write in markdown, capture tasks, and connect notes with [[wikilinks]]."
                  />
                ) : (
                  <div className="rounded-[1.8rem] border border-border/70 bg-background/88 p-6 shadow-sm">
                    <MarkdownNotePreview
                      content={selectedNote.content}
                      onWikiLinkClick={openOrCreateLinkedNote}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex min-h-[72vh] flex-col items-center justify-center gap-3 p-10 text-center">
              <StickyNote className="h-10 w-10 text-muted-foreground/40" />
              <h2 className="text-xl font-semibold">Choose a note or start a new one</h2>
              <p className="max-w-md text-sm leading-6 text-muted-foreground">
                Keep ideas, daily notes, and work context in one calmer space instead of a crowded
                board of controls.
              </p>
            </div>
          )}
        </Card>

        <Card className="overflow-hidden rounded-[1.75rem] border-border/70 shadow-sm">
          {selectedNote ? (
            <div className="min-h-[72vh]">
              <div className="border-b border-border/70 px-4 py-4">
                <p className="text-sm font-semibold">Inspector</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Metadata, links, templates, and note actions live here.
                </p>
              </div>

              <div className="space-y-5 p-4">
                <section className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <FolderKanban className="h-4 w-4 text-primary" />
                    Workspace metadata
                  </div>
                  <Input
                    value={selectedNote.folder || 'Workspace'}
                    onChange={(event) => updateSelectedNote({ folder: event.target.value })}
                    placeholder="Notebook"
                    className="rounded-2xl"
                  />
                  <Input
                    value={(selectedNote.tags || []).join(', ')}
                    onChange={(event) =>
                      updateSelectedNote({
                        tags: event.target.value
                          .split(',')
                          .map((tag) => tag.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="tags, comma separated"
                    className="rounded-2xl"
                  />
                  <div className="flex flex-wrap gap-2">
                    {NOTE_SWATCHES.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => updateSelectedNote({ color })}
                        className={`h-8 w-8 rounded-full border transition-transform ${
                          selectedNote.color === color ? 'scale-110 ring-2 ring-primary/40' : ''
                        }`}
                        style={{ backgroundColor: color }}
                        aria-label={`Select ${color}`}
                      />
                    ))}
                  </div>
                </section>

                <section className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Link2 className="h-4 w-4 text-primary" />
                    Linked work
                  </div>
                  <Select
                    value={selectedNote.linkedTaskIds?.[0] || 'none'}
                    onValueChange={(value) =>
                      updateSelectedNote({
                        linkedTaskId: value === 'none' ? undefined : value,
                        linkedTaskIds: value === 'none' ? [] : [value],
                      })
                    }
                  >
                    <SelectTrigger className="rounded-2xl">
                      <SelectValue placeholder="Link task" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No task linked</SelectItem>
                      {tasks.map((task) => (
                        <SelectItem key={task.id} value={task.id}>
                          {task.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={selectedNote.linkedEventIds?.[0] || 'none'}
                    onValueChange={(value) =>
                      updateSelectedNote({
                        linkedEventId: value === 'none' ? undefined : value,
                        linkedEventIds: value === 'none' ? [] : [value],
                      })
                    }
                  >
                    <SelectTrigger className="rounded-2xl">
                      <SelectValue placeholder="Link event" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No event linked</SelectItem>
                      {events.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2">
                    {selectedNote.linkedNoteTitles?.length ? (
                      selectedNote.linkedNoteTitles.map((title) => (
                        <button
                          key={title}
                          type="button"
                          onClick={() => openOrCreateLinkedNote(title)}
                          className="rounded-full border px-3 py-1 text-xs hover:bg-muted/35"
                        >
                          [[{title}]]
                        </button>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Wikilinks added in the editor appear here.
                      </p>
                    )}
                  </div>
                </section>

                <section className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <FileText className="h-4 w-4 text-primary" />
                    Templates and backlinks
                  </div>
                  <Button
                    variant={selectedNote.isTemplate ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateSelectedNote({ isTemplate: !selectedNote.isTemplate })}
                    className="w-full rounded-2xl"
                  >
                    {selectedNote.isTemplate ? 'Template enabled' : 'Save as template'}
                  </Button>
                  {templates.length ? (
                    <div className="rounded-2xl border bg-muted/20 p-3">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Start from template
                      </p>
                      <div className="space-y-2">
                        {templates.slice(0, 3).map((template) => (
                          <button
                            key={template.id}
                            type="button"
                            onClick={() => createFromTemplate(template)}
                            className="w-full rounded-xl border px-3 py-2 text-left text-sm hover:bg-background"
                          >
                            {template.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    {selectedBacklinks.length ? (
                      selectedBacklinks.map((note) => (
                        <button
                          key={note.id}
                          type="button"
                          onClick={() => setSelectedNoteId(note.id)}
                          className="rounded-full border px-3 py-1 text-xs hover:bg-muted/35"
                        >
                          {note.title}
                        </button>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Backlinks appear automatically when another note references this one.
                      </p>
                    )}
                  </div>
                </section>

                <section className="space-y-2 border-t border-border/70 pt-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    Note actions
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      selectedNote.archivedAt
                        ? restoreNote(selectedNote.id)
                        : archiveNote(selectedNote.id)
                    }
                    className="w-full rounded-2xl"
                  >
                    <Archive className="mr-2 h-4 w-4" />
                    {selectedNote.archivedAt ? 'Restore note' : 'Archive note'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full rounded-2xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => deleteNote(selectedNote.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete permanently
                  </Button>
                </section>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[72vh] items-center justify-center p-8 text-center text-sm text-muted-foreground">
              Select a note to inspect its metadata and links.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function NotesPage() {
  return (
    <Suspense fallback={<div>Loading notes...</div>}>
      <NotesPageClient />
    </Suspense>
  );
}
