import {
  buildDailyNoteTitle,
  findBacklinks,
  formatDailyNoteDate,
  normalizeNote,
} from '@/lib/notes';
import type { Note } from '@/lib/types';

function createNote(overrides: Partial<Note> = {}): Note {
  return {
    id: overrides.id || 'note-1',
    title: overrides.title || 'Daily Plan',
    content: overrides.content || '',
    color: overrides.color || '#ffffff',
    pinned: overrides.pinned ?? false,
    createdAt: overrides.createdAt || new Date('2026-03-19T08:00:00.000Z'),
    updatedAt: overrides.updatedAt || new Date('2026-03-19T08:00:00.000Z'),
    folder: overrides.folder,
    tags: overrides.tags,
    isTemplate: overrides.isTemplate,
    isDailyNote: overrides.isDailyNote,
    dailyNoteDate: overrides.dailyNoteDate,
    linkedNoteTitles: overrides.linkedNoteTitles,
    linkedTaskIds: overrides.linkedTaskIds,
    linkedEventIds: overrides.linkedEventIds,
    linkedTaskId: overrides.linkedTaskId,
    linkedEventId: overrides.linkedEventId,
  };
}

describe('notes utils', () => {
  it('normalizes legacy notes into the richer workspace model', () => {
    const normalized = normalizeNote(
      createNote({
        content: 'Discuss [[Project Brief]]\nPlan with [[Weekly Review]]',
        linkedTaskId: 'task-1',
        linkedEventId: 'event-1',
      }),
    );

    expect(normalized.folder).toBe('Workspace');
    expect(normalized.tags).toEqual([]);
    expect(normalized.linkedTaskIds).toEqual(['task-1']);
    expect(normalized.linkedEventIds).toEqual(['event-1']);
    expect(normalized.linkedNoteTitles).toEqual(['Project Brief', 'Weekly Review']);
  });

  it('finds backlinks by wikilink title', () => {
    const target = createNote({ id: 'target', title: 'Project Brief' });
    const backlink = createNote({
      id: 'source',
      title: 'Weekly Review',
      content: 'Prep notes for [[Project Brief]] before Friday.',
    });

    expect(findBacklinks(target, [target, backlink]).map((note) => note.id)).toEqual(['source']);
  });

  it('formats daily note helpers consistently', () => {
    const date = new Date('2026-03-19T08:00:00.000Z');

    expect(formatDailyNoteDate(date)).toBe('2026-03-19');
    expect(buildDailyNoteTitle(date)).toContain('2026');
  });
});
