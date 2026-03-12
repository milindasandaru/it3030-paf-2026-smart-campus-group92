import { render, screen } from '@testing-library/react';
import { DashboardPage } from './DashboardPage';

describe('DashboardPage', () => {
  it('renders the operations snapshot heading', async () => {
    render(<DashboardPage />);
    expect(screen.getByText(/operations snapshot/i)).toBeInTheDocument();
    expect(screen.getByText(/keep facilities responsive/i)).toBeInTheDocument();
    expect(await screen.findByText(/active bookings/i)).toBeInTheDocument();
  });
});
