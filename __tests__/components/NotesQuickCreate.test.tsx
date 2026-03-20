import { render } from '@testing-library/react';
import NotesPage from '@/app/(main)/notes/page';

const replace = jest.fn();
const addNote = jest.fn(() => 'note-1');

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace,
  }),
  useSearchParams: () => ({
    get: (key: string) => {
      if (key === 'new') return 'note';
      return null;
    },
  }),
}));

jest.mock('@/contexts/AppContext', () => ({
  useApp: () => ({
    notes: [],
    addNote,
    updateNote: jest.fn(),
    deleteNote: jest.fn(),
    toggleNotePin: jest.fn(),
    archiveNote: jest.fn(),
    restoreNote: jest.fn(),
    tasks: [],
    events: [],
  }),
}));

describe('Notes quick create', () => {
  beforeEach(() => {
    replace.mockReset();
    addNote.mockClear();
  });

  it('creates a new note only once for the same route-triggered quick action', () => {
    const { rerender } = render(<NotesPage />);

    rerender(<NotesPage />);

    expect(addNote).toHaveBeenCalledTimes(1);
    expect(addNote).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Untitled note',
        content: '',
      }),
    );
    expect(replace).toHaveBeenCalledWith('/notes');
  });
});
