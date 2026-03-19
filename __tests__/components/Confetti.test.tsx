import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock the AppContext
const mockUseApp = jest.fn();
jest.mock('@/contexts/AppContext', () => ({
  useApp: () => mockUseApp(),
}));

import { Confetti } from '@/components/common/Confetti';

describe('Confetti component', () => {
  it('renders nothing when showConfetti is false', () => {
    mockUseApp.mockReturnValue({ showConfetti: false });
    const { container } = render(<Confetti />);
    expect(container.firstChild).toBeNull();
  });

  it('renders confetti particles when showConfetti is true', () => {
    mockUseApp.mockReturnValue({ showConfetti: true });
    const { container } = render(<Confetti />);
    expect(container.firstChild).not.toBeNull();
    expect(container.querySelector('.fixed')).toBeInTheDocument();
  });
});
