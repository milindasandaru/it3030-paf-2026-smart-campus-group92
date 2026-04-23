import { Link } from 'react-router-dom';
import { DashboardStatCard } from '../components/DashboardStatCard';
import { SectionCard } from '../components/SectionCard';
import { useDashboardSnapshot } from '../hooks/useDashboardSnapshot';

export function AdminDashboardPage() {
  const { bookings, tickets, loading, error } = useDashboardSnapshot();
  const pendingBookings = bookings.filter((booking) => booking.status === 'PENDING').length;
  const openTickets = tickets.filter(
    (ticket) => ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS',
  ).length;

  return (
    <div className="page-grid dashboard-page">
      <section className="hero-card dashboard-hero">
        <p className="eyebrow">Admin dashboard</p>
        <h2>Campus-wide operational control</h2>
        <p>Monitor demand, triage issues, and move quickly across resource operations.</p>
      </section>

      {error ? <p className="error-text">{error}</p> : null}

      <div className="dashboard-stats">
        <DashboardStatCard
          title="Total bookings"
          value={bookings.length}
          description="All bookings currently visible in the system."
        />
        <DashboardStatCard
          title="Pending bookings"
          value={pendingBookings}
          description="Requests waiting for approval or rejection."
        />
        <DashboardStatCard
          title="Open tickets"
          value={openTickets}
          description="Tickets still waiting for technician action or closure."
        />
      </div>

      <SectionCard
        title="Quick actions"
        action={
          <div className="dashboard-actions">
            <Link className="ghost-button" to="/bookings">
              Review bookings
            </Link>
            <Link className="ghost-button" to="/tickets">
              Open tickets
            </Link>
            <Link className="ghost-button" to="/admin/resources">
              Manage resources
            </Link>
          </div>
        }
      >
        {loading ? <p>Loading dashboard data...</p> : null}
        {!loading ? (
          <ul className="timeline-list">
            <li>{pendingBookings} booking requests are waiting for review.</li>
            <li>{openTickets} tickets still need active follow-up.</li>
            <li>{bookings.length} total bookings are currently tracked in the system.</li>
          </ul>
        ) : null}
      </SectionCard>
    </div>
  );
}
