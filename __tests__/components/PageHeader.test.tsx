import { render, screen } from '@testing-library/react';
import { CalendarDays } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';

describe('PageHeader', () => {
  it('renders a forwarded-ref icon component and rich description content', () => {
    render(
      <PageHeader title="Dashboard" description={<div>Today overview</div>} icon={CalendarDays} />,
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Today overview')).toBeInTheDocument();
    expect(screen.getByTestId('page-header-icon')).toBeInTheDocument();
  });
});
