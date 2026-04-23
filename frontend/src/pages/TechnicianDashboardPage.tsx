import { DashboardStatCard } from '../components/DashboardStatCard';
import { SectionCard } from '../components/SectionCard';
import { useAuth } from '../hooks/useAuth';
import { useDashboardSnapshot } from '../hooks/useDashboardSnapshot';

export function TechnicianDashboardPage() {
  const { user } = useAuth();
  const { tickets, loading, error } = useDashboardSnapshot();

  const assignedTickets = tickets.filter((ticket) => ticket.assigneeId === user?.userId);
  const inProgressTickets = assignedTickets.filter((ticket) => ticket.status === 'IN_PROGRESS');
  const openAssignments = assignedTickets.filter((ticket) => ticket.status === 'OPEN');

  return (
    <div className="page-grid dashboard-page">
      <section className="hero-card dashboard-hero">
        <p className="eyebrow">Technician dashboard</p>
        <h2>Assigned work, clearly tracked</h2>
        <p>Focus on the tickets assigned to you and keep repair work moving forward.</p>
      </section>

      {error ? <p className="error-text">{error}</p> : null}

      <div className="dashboard-stats">
        <DashboardStatCard
          title="Assigned tickets"
          value={assignedTickets.length}
          description="Tickets currently assigned to your technician account."
        />
        <DashboardStatCard
          title="In progress"
          value={inProgressTickets.length}
          description="Tickets where work has already started."
        />
        <DashboardStatCard
          title="Ready to start"
          value={openAssignments.length}
          description="Assigned tickets that are still open and waiting for action."
        />
      </div>

      <SectionCard title="Technician summary">
        {loading ? <p>Loading dashboard data...</p> : null}
        {!loading ? (
          <ul className="timeline-list">
            <li>{openAssignments.length} assigned tickets are ready to be picked up.</li>
            <li>{inProgressTickets.length} tickets are actively being worked on.</li>
            <li>
              {
                assignedTickets.filter((ticket) => ticket.status === 'RESOLVED').length
              }{' '}
              assigned tickets are waiting for reporter closure.
            </li>
          </ul>
        ) : null}
      </SectionCard>
    </div>
  );
}
