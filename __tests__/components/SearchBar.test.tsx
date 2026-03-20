import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from '@/components/layout/SearchBar';

const push = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push,
  }),
}));

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

jest.mock('@/contexts/AppContext', () => ({
  useApp: () => ({
    searchDocuments: [
      {
        id: 'note-1',
        entityId: 'note-1',
        title: 'Project Brief',
        body: '# Project Brief ## Next actions - [ ] Working draft for the launch plan [[Launch]]',
        section: 'Notes',
        type: 'note',
        keywords: ['launch', 'brief'],
        url: '/notes?note=note-1',
        updatedAt: new Date('2026-03-20T08:00:00.000Z'),
      },
      {
        id: 'cmd-1',
        entityId: 'new-task',
        title: 'Create task',
        body: 'Quick capture a new task',
        section: 'Commands',
        type: 'command',
        keywords: ['new', 'task'],
        url: '/tasks?new=task',
        updatedAt: new Date('2026-03-20T08:00:00.000Z'),
      },
    ],
  }),
}));

describe('SearchBar', () => {
  beforeEach(() => {
    push.mockReset();
    Object.defineProperty(window, 'ResizeObserver', {
      writable: true,
      configurable: true,
      value: ResizeObserverMock,
    });
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  it('opens the command palette and routes to a selected result', async () => {
    const user = userEvent.setup();

    render(<SearchBar />);

    await user.click(screen.getByRole('button', { name: /search everything/i }));
    await user.type(screen.getByPlaceholderText(/search tasks, notes, calendar links/i), 'project');

    await user.click(screen.getByText('Project Brief'));

    expect(push).toHaveBeenCalledWith('/notes?note=note-1');
  });

  it('renders cleaned preview text instead of raw markdown noise', async () => {
    const user = userEvent.setup();

    render(<SearchBar />);

    await user.click(screen.getByRole('button', { name: /search everything/i }));
    await user.type(screen.getByPlaceholderText(/search tasks, notes, calendar links/i), 'project');

    expect(screen.getByText(/working draft for the launch plan launch/i)).toBeInTheDocument();
    expect(screen.queryByText(/\[\[launch\]\]/i)).not.toBeInTheDocument();
  });
});
