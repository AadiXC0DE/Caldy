import type { Note } from './types';

const DEFAULT_NOTE_COLOR = '#ffffff';
const DEFAULT_NOTE_FOLDER = 'Workspace';
const DAILY_NOTE_FOLDER = 'Daily Notes';

function uniqueStrings(values: string[] = []) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

export function slugifyNoteTitle(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function extractWikiLinks(content: string) {
  return uniqueStrings(
    Array.from(content.matchAll(/\[\[([^[\]]+)\]\]/g), (match) => match[1] ?? ''),
  );
}

export function formatDailyNoteDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function buildDailyNoteTitle(date: Date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function normalizeNote(note: Note): Note {
  const createdAt = note.createdAt ? new Date(note.createdAt) : new Date();
  const updatedAt = note.updatedAt ? new Date(note.updatedAt) : createdAt;
  const title = note.title?.trim() || 'Untitled';
  const isDailyNote = Boolean(note.isDailyNote || note.dailyNoteDate);
  const dailyNoteDate =
    note.dailyNoteDate || (isDailyNote ? formatDailyNoteDate(createdAt) : undefined);
  const linkedTaskIds = uniqueStrings(
    note.linkedTaskIds || (note.linkedTaskId ? [note.linkedTaskId] : []),
  );
  const linkedEventIds = uniqueStrings(
    note.linkedEventIds || (note.linkedEventId ? [note.linkedEventId] : []),
  );

  return {
    ...note,
    title,
    content: note.content || '',
    color: note.color || DEFAULT_NOTE_COLOR,
    pinned: Boolean(note.pinned),
    folder: note.folder?.trim() || (isDailyNote ? DAILY_NOTE_FOLDER : DEFAULT_NOTE_FOLDER),
    tags: uniqueStrings(note.tags),
    isTemplate: Boolean(note.isTemplate),
    isDailyNote,
    dailyNoteDate,
    linkedNoteTitles: uniqueStrings(
      note.linkedNoteTitles?.length ? note.linkedNoteTitles : extractWikiLinks(note.content || ''),
    ),
    linkedTaskIds,
    linkedEventIds,
    linkedTaskId: note.linkedTaskId || linkedTaskIds[0],
    linkedEventId: note.linkedEventId || linkedEventIds[0],
    createdAt,
    updatedAt,
  };
}

export function findBacklinks(target: Note, notes: Note[]) {
  const matchable = new Set(uniqueStrings([target.title]).map((value) => value.toLowerCase()));

  return notes.filter((note) => {
    if (note.id === target.id) return false;

    return extractWikiLinks(note.content || '').some((link) => matchable.has(link.toLowerCase()));
  });
}
