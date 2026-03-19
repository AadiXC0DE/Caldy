import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MarkdownNotePreview } from '@/components/notes/MarkdownNotePreview';

describe('MarkdownNotePreview', () => {
  it('renders markdown-like blocks and emits wikilink clicks', async () => {
    const user = userEvent.setup();
    const onWikiLinkClick = jest.fn();

    render(
      <MarkdownNotePreview
        content={'# Daily Note\n\n- [x] Review tasks\n\nLink to [[Project Brief]]'}
        onWikiLinkClick={onWikiLinkClick}
      />,
    );

    expect(screen.getByText('Daily Note')).toBeInTheDocument();
    expect(screen.getByText('Review tasks')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Project Brief' }));
    expect(onWikiLinkClick).toHaveBeenCalledWith('Project Brief');
  });
});
