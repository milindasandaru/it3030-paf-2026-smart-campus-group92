import { DashboardStatCard } from '../components/DashboardStatCard';
import { SectionCard } from '../components/SectionCard';
import { useAuth } from '../hooks/useAuth';
import { useDashboardSnapshot } from '../hooks/useDashboardSnapshot';

export function LecturerDashboardPage() {
  const { user } = useAuth();
  const { bookings, tickets, loading, error } = useDashboardSnapshot();

  const myBookings = bookings.filter((booking) => booking.userId === user?.userId);
  const myTickets = tickets.filter((ticket) => ticket.reporterId === user?.userId);

  return (
    <div className="page-grid dashboard-page">
      <section className="hero-card dashboard-hero">
        <p className="eyebrow">Lecturer dashboard</p>
        <h2>Teaching resources at a glance</h2>
        <p>Stay on top of bookings and support issues tied to your teaching work.</p>
      </section>

      {error ? <p className="error-text">{error}</p> : null}

      <div className="dashboard-stats">
        <DashboardStatCard
          title="My bookings"
          value={myBookings.length}
          description="Bookings you created for classes, labs, and spaces."
        />
        <DashboardStatCard
          title="Active bookings"
          value={myBookings.filter((booking) => booking.status !== 'CANCELLED').length}
          description="Bookings that are still pending or approved."
        />
        <DashboardStatCard
          title="My tickets"
          value={myTickets.length}
          description="Support tickets you have raised so far."
        />
      </div>

      <SectionCard title="Lecturer summary">
        {loading ? <p>Loading dashboard data...</p> : null}
        {!loading ? (
          <ul className="timeline-list">
            <li>
              {myBookings.filter((booking) => booking.status === 'PENDING').length} bookings are
              awaiting a decision.
            </li>
            <li>
              {myTickets.filter((ticket) => ticket.status !== 'CLOSED').length} tickets are still
              open or in progress.
            </li>
            <li>{myBookings.length} bookings are linked to your account overall.</li>
          </ul>
        ) : null}
      </SectionCard>
    </div>
  );
}
