import { useEffect, useState } from 'react';
import { fetchResources } from '../api/resourcesApi';
import type { Resource } from '../api/types';
import { DashboardStatCard } from '../components/DashboardStatCard';
import { SectionCard } from '../components/SectionCard';
import { useAuth } from '../hooks/useAuth';
import { useDashboardSnapshot } from '../hooks/useDashboardSnapshot';

export function StaffDashboardPage() {
  const { user } = useAuth();
  const { bookings, tickets, loading, error } = useDashboardSnapshot();
  const [resources, setResources] = useState<Resource[]>([]);

  useEffect(() => {
    fetchResources().then(setResources).catch(() => {});
  }, []);

  const myBookings = bookings.filter((b) => b.requesterId === user?.userId);
  const myTickets = tickets.filter((t) => t.reporterId === user?.userId);
  const activeResources = resources.filter((r) => r.status === 'ACTIVE');
  const maintenanceResources = resources.filter((r) => r.status === 'MAINTENANCE');

  const pendingBookings = myBookings.filter((b) => b.status === 'PENDING');
  const approvedBookings = myBookings.filter((b) => b.status === 'APPROVED');
  const openTickets = myTickets.filter((t) => t.status !== 'CLOSED');

  return (
    <div className="page-grid dashboard-page">
      <section className="hero-card dashboard-hero">
        <p className="eyebrow">Staff dashboard</p>
        <h2>Campus operations at a glance</h2>
        <p>Manage facility bookings, track support requests, and monitor campus resources.</p>
      </section>

      {error ? <p className="error-text">{error}</p> : null}

      <div className="dashboard-stats">
        <DashboardStatCard
          title="My bookings"
          value={myBookings.length}
          description="Facility and resource bookings linked to your account."
        />
        <DashboardStatCard
          title="Approved bookings"
          value={approvedBookings.length}
          description="Confirmed bookings ready to use."
        />
        <DashboardStatCard
          title="Open tickets"
          value={openTickets.length}
          description="Support requests you have submitted that are still active."
        />
        <DashboardStatCard
          title="Available resources"
          value={activeResources.length}
          description="Campus resources currently active and bookable."
        />
      </div>

      <SectionCard title="Staff activity summary">
        {loading ? <p>Loading dashboard data...</p> : null}
        {!loading ? (
          <ul className="timeline-list">
            <li>
              {pendingBookings.length} booking{pendingBookings.length !== 1 ? 's' : ''} awaiting
              approval.
            </li>
            <li>
              {approvedBookings.length} booking{approvedBookings.length !== 1 ? 's' : ''} confirmed
              and ready.
            </li>
            <li>
              {openTickets.length} support ticket{openTickets.length !== 1 ? 's' : ''} still open or
              in progress.
            </li>
            <li>{myBookings.length + myTickets.length} total records linked to your account.</li>
          </ul>
        ) : null}
      </SectionCard>

      <SectionCard title="Campus resources overview">
        {resources.length === 0 ? <p>Loading resource data...</p> : null}
        {resources.length > 0 ? (
          <ul className="timeline-list">
            <li>{activeResources.length} resources are active and available for booking.</li>
            <li>
              {maintenanceResources.length} resource
              {maintenanceResources.length !== 1 ? 's' : ''} currently under maintenance.
            </li>
            <li>{resources.length} total resources registered in the system.</li>
          </ul>
        ) : null}
      </SectionCard>
    </div>
  );
}
