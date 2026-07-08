import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  downloadBookingReport,
  getBookingTrends,
  getPeakHours,
  getTicketStatusDistribution,
  getTopResources,
  type BookingTrendPoint,
  type PeakHourPoint,
  type TicketStatusPoint,
  type TopResourcePoint,
} from '../api/analyticsApi';
import { DashboardStatCard } from '../components/DashboardStatCard';
import { SectionCard } from '../components/SectionCard';
import { useDashboardSnapshot } from '../hooks/useDashboardSnapshot';

export function AdminDashboardPage() {
  const { bookings, tickets, loading, error } = useDashboardSnapshot();
  const [topResources, setTopResources] = useState<TopResourcePoint[]>([]);
  const [peakHours, setPeakHours] = useState<PeakHourPoint[]>([]);
  const [bookingTrends, setBookingTrends] = useState<BookingTrendPoint[]>([]);
  const [ticketStatus, setTicketStatus] = useState<TicketStatusPoint[]>([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const pendingBookings = bookings.filter((booking) => booking.status === 'PENDING').length;
  const openTickets = tickets.filter(
    (ticket) => ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS',
  ).length;
  const activeUsers = useMemo(
    () => new Set([...bookings.map((b) => b.userId), ...tickets.map((t) => t.reporterId)]).size,
    [bookings, tickets],
  );

  useEffect(() => {
    async function loadAnalytics() {
      const [resourcesData, peaksData, trendsData, statusData] = await Promise.all([
        getTopResources(),
        getPeakHours(),
        getBookingTrends(),
        getTicketStatusDistribution(),
      ]);
      setTopResources(resourcesData);
      setPeakHours(peaksData);
      setBookingTrends(trendsData);
      setTicketStatus(statusData);
    }
    void loadAnalytics();
  }, []);

  async function onDownloadCsv() {
    setReportLoading(true);
    setReportError(null);
    try {
      const blob = await downloadBookingReport({ format: 'csv' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'bookings-report.csv';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    } catch (error) {
      setReportError(error instanceof Error ? error.message : 'Failed to generate report');
    } finally {
      setReportLoading(false);
    }
  }

  return (
    <div className="page-grid dashboard-page">
      <section className="hero-card dashboard-hero">
        <p className="eyebrow">Admin dashboard</p>
        <h2>Campus-wide operational control</h2>
        <p>Monitor demand, triage issues, and move quickly across resource operations.</p>
      </section>

      {error ? <p className="error-text">{error}</p> : null}
      {reportError ? <p className="error-text">{reportError}</p> : null}

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
        <DashboardStatCard
          title="Active users"
          value={activeUsers}
          description="Distinct booking requesters and ticket reporters."
        />
      </div>

      <SectionCard title="Analytics charts">
        <div className="details-grid">
          <div className="chart-tile">
            <h3>Top Resources Usage</h3>
            <div className="chart-canvas">
              <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topResources}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="resourceName" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="bookingCount" fill="#4f46e5" />
              </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="chart-tile">
            <h3>Peak Booking Hours</h3>
            <div className="chart-canvas">
              <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakHours}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hourOfDay" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="bookingCount" fill="#0ea5e9" />
              </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="chart-tile">
            <h3>Booking Trends</h3>
            <div className="chart-canvas">
              <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bookingTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bookingDate" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="bookingCount" stroke="#16a34a" />
              </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="chart-tile">
            <h3>Ticket Status Distribution</h3>
            <div className="chart-canvas">
              <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={ticketStatus} dataKey="ticketCount" nameKey="status" label>
                  {ticketStatus.map((entry, index) => (
                    <Cell
                      key={`${entry.status}-${index}`}
                      fill={['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'][index % 5]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </SectionCard>

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
            <button
              className="ghost-button"
              type="button"
              disabled={reportLoading}
              onClick={() => void onDownloadCsv()}
            >
              {reportLoading ? 'Generating report...' : 'Generate report'}
            </button>
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
