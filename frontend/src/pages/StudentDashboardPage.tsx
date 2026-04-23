import { DashboardStatCard } from '../components/DashboardStatCard';
import { SectionCard } from '../components/SectionCard';
import { useAuth } from '../hooks/useAuth';
import { useDashboardSnapshot } from '../hooks/useDashboardSnapshot';

export function StudentDashboardPage() {
  const { user } = useAuth();
  const { bookings, tickets, loading, error } = useDashboardSnapshot();

  const myBookings = bookings.filter((booking) => booking.userId === user?.userId);
  const myTickets = tickets.filter((ticket) => ticket.reporterId === user?.userId);

  return (
    <div className="page-grid dashboard-page">
      <section className="hero-card dashboard-hero">
        <p className="eyebrow">Student dashboard</p>
        <h2>Your campus services in one view</h2>
        <p>Track your bookings, ticket updates, and current campus support activity.</p>
      </section>

      {error ? <p className="error-text">{error}</p> : null}

      <div className="dashboard-stats">
        <DashboardStatCard
          title="My bookings"
          value={myBookings.length}
          description="Resource bookings connected to your account."
        />
        <DashboardStatCard
          title="Approved bookings"
          value={myBookings.filter((booking) => booking.status === 'APPROVED').length}
          description="Bookings that are confirmed and ready to use."
        />
        <DashboardStatCard
          title="My tickets"
          value={myTickets.length}
          description="Support requests you have submitted."
        />
      </div>

      <SectionCard title="Student activity">
        {loading ? <p>Loading dashboard data...</p> : null}
        {!loading ? (
          <ul className="timeline-list">
            <li>
              {myBookings.filter((booking) => booking.status === 'PENDING').length} bookings are
              waiting for approval.
            </li>
            <li>
              {myTickets.filter((ticket) => ticket.status !== 'CLOSED').length} tickets are still
              active.
            </li>
            <li>{myBookings.length + myTickets.length} total records are linked to your profile.</li>
          </ul>
        ) : null}
      </SectionCard>
    </div>
  );
}
