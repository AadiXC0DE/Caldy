'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CalendarDays,
  FileText,
  FolderKanban,
  Link2,
  ListTodo,
  Pin,
  PinOff,
  Plus,
  Search,
  Sparkles,
  StickyNote,
  Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { buildDailyNoteTitle, findBacklinks, formatDailyNoteDate } from '@/lib/notes';
import type { Note } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MarkdownNotePreview } from '@/components/notes/MarkdownNotePreview';

const NOTE_COLORS = [
  '#ffffff',
  '#fef3c7',
  '#dbeafe',
  '#dcfce7',
  '#fce7f3',
  '#e9d5ff',
  '#fed7aa',
  '#cffafe',
];

const DEFAULT_NOTE_CONTENT = `# Untitled note

- [ ] Capture the next action
- [ ] Link an idea with [[Another Note]]
`;

function sortNotes(notes: Note[]) {
  return [...notes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

function buildDefaultNote(overrides: Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>> = {}) {
  return {
    title: 'Untitled note',
    content: DEFAULT_NOTE_CONTENT,
    color: NOTE_COLORS[0],
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

function NotesPageClient() {
  const { notes, addNote, updateNote, deleteNote, toggleNotePin, tasks, events } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<'write' | 'preview'>('write');

  const folders = useMemo(() => {
    const folderList = Array.from(new Set(notes.map((note) => note.folder || 'Workspace'))).sort();
    return ['all', ...folderList];
  }, [notes]);

  const tags = useMemo(() => {
    const tagList = Array.from(new Set(notes.flatMap((note) => note.tags || []))).sort();
    return ['all', ...tagList];
  }, [notes]);

  const filteredNotes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return sortNotes(notes).filter((note) => {
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
  }, [notes, searchQuery, selectedFolder, selectedTag]);

  useEffect(() => {
    if (!filteredNotes.length) {
      setSelectedNoteId(null);
      return;
    }

    if (!selectedNoteId || !notes.some((note) => note.id === selectedNoteId)) {
      setSelectedNoteId(filteredNotes[0].id);
    }
  }, [filteredNotes, notes, selectedNoteId]);

  useEffect(() => {
    const newItem = searchParams.get('new');
    if (newItem === 'note') {
      const noteId = addNote(buildDefaultNote());
      setSelectedNoteId(noteId);
      setEditorMode('write');
      router.replace('/notes');
    }
  }, [addNote, router, searchParams]);

  const selectedNote = notes.find((note) => note.id === selectedNoteId) || filteredNotes[0] || null;

  const templates = useMemo(() => sortNotes(notes.filter((note) => note.isTemplate)), [notes]);
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
  };

  const createDailyNote = () => {
    const dailyNoteDate = formatDailyNoteDate(new Date());
    const existing = notes.find((note) => note.dailyNoteDate === dailyNoteDate);

    if (existing) {
      setSelectedNoteId(existing.id);
      return;
    }

    createNote({
      title: buildDailyNoteTitle(new Date()),
      folder: 'Daily Notes',
      isDailyNote: true,
      dailyNoteDate,
      color: '#dbeafe',
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
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
      >
        <div>
          <h1 className="flex items-center text-3xl font-bold">
            <StickyNote className="mr-2 h-8 w-8 text-primary" />
            Notes Workspace
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Capture fast, write in markdown, connect ideas with wikilinks, and keep daily notes,
            templates, tasks, and events in one local-first knowledge space.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={createDailyNote}>
            <Sparkles className="mr-2 h-4 w-4" />
            Daily Note
          </Button>
          <Button onClick={() => createNote()}>
            <Plus className="mr-2 h-4 w-4" />
            New Note
          </Button>
        </div>
      </motion.div>

      <div className="grid gap-5 xl:grid-cols-[290px_minmax(0,1fr)]">
        <Card className="min-h-[68vh] overflow-hidden xl:sticky xl:top-6 xl:self-start">
          <CardHeader className="space-y-4">
            <div>
              <CardTitle className="text-lg">Browse notes</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Search fast, filter lightly, and jump back into your writing.
              </p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search notes..."
                className="pl-9"
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter notebook" />
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
                <SelectTrigger>
                  <SelectValue placeholder="Filter tag" />
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
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{filteredNotes.length} notes</Badge>
              {selectedFolder !== 'all' && <Badge variant="outline">{selectedFolder}</Badge>}
              {selectedTag !== 'all' && <Badge variant="outline">#{selectedTag}</Badge>}
            </div>
          </CardHeader>
          <CardContent className="max-h-[calc(68vh-8rem)] space-y-4 overflow-y-auto pr-1">
            {filteredNotes.length ? (
              <div className="space-y-3">
                {filteredNotes.map((note) => (
                  <button
                    key={note.id}
                    type="button"
                    onClick={() => setSelectedNoteId(note.id)}
                    className={`w-full rounded-2xl border p-3 text-left transition-all ${
                      selectedNote?.id === note.id
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-medium">{note.title}</p>
                          {note.isTemplate && <Badge variant="secondary">Template</Badge>}
                          {note.isDailyNote && <Badge variant="secondary">Daily</Badge>}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {note.folder || 'Workspace'} •{' '}
                          {format(new Date(note.updatedAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                      {note.pinned && <Pin className="mt-0.5 h-4 w-4 text-primary" />}
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {note.content}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed p-6 text-center">
                <p className="font-medium">Nothing matches this view yet.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create a note, add a daily entry, or loosen the filters to explore more of your
                  workspace.
                </p>
              </div>
            )}

            {templates.length > 0 && (
              <div className="rounded-2xl border bg-muted/20 p-3">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <FileText className="h-4 w-4 text-primary" />
                  Quick start from template
                </div>
                <div className="space-y-2">
                  {templates.slice(0, 3).map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => createFromTemplate(template)}
                      className="w-full rounded-xl border px-3 py-2 text-left text-sm transition-colors hover:bg-background"
                    >
                      {template.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="min-h-[68vh] overflow-hidden">
          {selectedNote ? (
            <>
              <CardHeader className="space-y-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Editor
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Use markdown, checklists, and wikilinks like{' '}
                      <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                        [[Project Brief]]
                      </span>
                      .
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={editorMode === 'write' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setEditorMode('write')}
                    >
                      Write
                    </Button>
                    <Button
                      variant={editorMode === 'preview' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setEditorMode('preview')}
                    >
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleNotePin(selectedNote.id)}
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => deleteNote(selectedNote.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>

                <Input
                  value={selectedNote.title}
                  onChange={(event) => updateSelectedNote({ title: event.target.value })}
                  placeholder="Note title"
                  className="h-12 rounded-2xl border-muted/70 text-lg font-semibold"
                />
              </CardHeader>

              <CardContent className="space-y-5">
                <div className="rounded-2xl border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                  {selectedNote.folder || 'Workspace'} • Updated{' '}
                  {format(new Date(selectedNote.updatedAt), 'MMM d, yyyy')}
                </div>

                {editorMode === 'write' ? (
                  <div
                    className="rounded-[1.75rem] border p-5 shadow-sm"
                    style={{ backgroundColor: `${selectedNote.color}35` }}
                  >
                    <Textarea
                      value={selectedNote.content}
                      onChange={(event) => updateSelectedNote({ content: event.target.value })}
                      className="min-h-[620px] resize-y border-0 bg-transparent p-0 font-mono text-[15px] leading-7 shadow-none focus-visible:ring-0"
                      placeholder="Write in markdown, capture tasks, and connect notes with [[wikilinks]]."
                    />
                  </div>
                ) : (
                  <div
                    className="rounded-[1.75rem] border p-6 shadow-sm"
                    style={{ backgroundColor: `${selectedNote.color}50` }}
                  >
                    <MarkdownNotePreview
                      content={selectedNote.content}
                      onWikiLinkClick={openOrCreateLinkedNote}
                    />
                  </div>
                )}

                <div className="grid gap-4 xl:grid-cols-3">
                  <div className="rounded-[1.5rem] border p-4">
                    <div className="mb-3 flex items-center gap-2 font-semibold">
                      <FolderKanban className="h-4 w-4 text-primary" />
                      Note details
                    </div>
                    <div className="space-y-3">
                      <Input
                        value={selectedNote.folder || 'Workspace'}
                        onChange={(event) => updateSelectedNote({ folder: event.target.value })}
                        placeholder="Notebook"
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
                        placeholder="tags, comma, separated"
                      />
                      <Select
                        value={selectedNote.linkedTaskIds?.[0] || 'none'}
                        onValueChange={(value) =>
                          updateSelectedNote({
                            linkedTaskId: value === 'none' ? undefined : value,
                            linkedTaskIds: value === 'none' ? [] : [value],
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Link a task" />
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
                        <SelectTrigger>
                          <SelectValue placeholder="Link an event" />
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
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border p-4">
                    <div className="mb-3 flex items-center gap-2 font-semibold">
                      <FileText className="h-4 w-4 text-primary" />
                      Style and actions
                    </div>
                    <div className="mb-4 flex flex-wrap gap-2">
                      {NOTE_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => updateSelectedNote({ color })}
                          className={`h-7 w-7 rounded-full border transition-transform ${
                            selectedNote.color === color ? 'scale-110 ring-2 ring-primary/50' : ''
                          }`}
                          style={{ backgroundColor: color }}
                          aria-label={`Set note color ${color}`}
                        />
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={selectedNote.isTemplate ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateSelectedNote({ isTemplate: !selectedNote.isTemplate })}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        {selectedNote.isTemplate ? 'Template active' : 'Make template'}
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border p-4">
                    <div className="mb-3 flex items-center gap-2 font-semibold">
                      <Link2 className="h-4 w-4 text-primary" />
                      Outgoing links
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedNote.linkedNoteTitles?.length ? (
                        selectedNote.linkedNoteTitles.map((title) => (
                          <button
                            key={title}
                            type="button"
                            onClick={() => openOrCreateLinkedNote(title)}
                            className="rounded-full border px-3 py-1 text-xs transition-colors hover:bg-muted/60"
                          >
                            [[{title}]]
                          </button>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Add wikilinks in the editor to connect related notes.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                  <div className="rounded-[1.5rem] border p-4">
                    <div className="mb-3 flex items-center gap-2 font-semibold">
                      <StickyNote className="h-4 w-4 text-primary" />
                      Backlinks
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedBacklinks.length ? (
                        selectedBacklinks.map((note) => (
                          <button
                            key={note.id}
                            type="button"
                            onClick={() => setSelectedNoteId(note.id)}
                            className="rounded-full border px-3 py-1 text-xs transition-colors hover:bg-muted/60"
                          >
                            {note.title}
                          </button>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Notes that reference this one will show up here automatically.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border p-4">
                    <div className="mb-3 flex items-center gap-2 font-semibold">
                      <ListTodo className="h-4 w-4 text-primary" />
                      Linked work
                    </div>
                    <div className="space-y-2 text-sm">
                      {selectedNote.linkedTaskIds?.[0] && (
                        <p className="rounded-xl bg-muted/60 px-3 py-2">
                          Task:{' '}
                          {tasks.find((task) => task.id === selectedNote.linkedTaskIds?.[0])?.title}
                        </p>
                      )}
                      {selectedNote.linkedEventIds?.[0] && (
                        <p className="rounded-xl bg-muted/60 px-3 py-2">
                          Event:{' '}
                          {
                            events.find((event) => event.id === selectedNote.linkedEventIds?.[0])
                              ?.title
                          }
                        </p>
                      )}
                      {!selectedNote.linkedTaskIds?.[0] && !selectedNote.linkedEventIds?.[0] && (
                        <p className="text-muted-foreground">
                          Link a task or calendar event above to keep work and reference material
                          together.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex h-full min-h-[60vh] items-center justify-center">
              <div className="max-w-md text-center">
                <StickyNote className="mx-auto h-12 w-12 text-primary/40" />
                <h2 className="mt-4 text-xl font-semibold">Build your thinking space</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Create a note, start a daily entry, or reuse a template to turn Caldy into a
                  proper personal workspace.
                </p>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
                  <Button onClick={() => createNote()}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Note
                  </Button>
                  <Button variant="outline" onClick={createDailyNote}>
                    <CalendarDays className="mr-2 h-4 w-4" />
                    Daily Note
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function NotesPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-[60vh] w-full" />
        </div>
      }
    >
      <NotesPageClient />
    </Suspense>
  );
}
