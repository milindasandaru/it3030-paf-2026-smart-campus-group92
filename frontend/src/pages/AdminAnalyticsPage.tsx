import { useMemo } from 'react';
import { DashboardStatCard } from '../components/DashboardStatCard';
import { SectionCard } from '../components/SectionCard';
import { useDashboardSnapshot } from '../hooks/useDashboardSnapshot';

function pct(val: number, total: number) {
  if (total === 0) return '0%';
  return `${Math.round((val / total) * 100)}%`;
}

function hoursLabel(h: number) {
  if (h < 1) return '< 1h';
  if (h < 24) return `${Math.round(h)}h`;
  return `${Math.round(h / 24)}d`;
}

export function AdminAnalyticsPage() {
  const { bookings, tickets, loading, error } = useDashboardSnapshot();

  const bookingStats = useMemo(() => {
    const total = bookings.length;
    const approved = bookings.filter((b) => b.status === 'APPROVED').length;
    const pending = bookings.filter((b) => b.status === 'PENDING').length;
    const rejected = bookings.filter((b) => b.status === 'REJECTED').length;
    const cancelled = bookings.filter((b) => b.status === 'CANCELLED').length;
    return { total, approved, pending, rejected, cancelled };
  }, [bookings]);

  const ticketStats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter((t) => t.status === 'OPEN').length;
    const inProgress = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
    const resolved = tickets.filter((t) => t.status === 'RESOLVED').length;
    const closed = tickets.filter((t) => t.status === 'CLOSED').length;
    const critical = tickets.filter((t) => t.priority === 'CRITICAL').length;
    const high = tickets.filter((t) => t.priority === 'HIGH').length;
    return { total, open, inProgress, resolved, closed, critical, high };
  }, [tickets]);

  const topResources = useMemo(() => {
    const counts: Record<string, { name: string; count: number }> = {};
    bookings.forEach((b) => {
      const key = String(b.resourceId);
      const name = b.resourceName ?? `Resource ${key}`;
      if (!counts[key]) counts[key] = { name, count: 0 };
      counts[key].count++;
    });
    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [bookings]);

  const peakHours = useMemo(() => {
    const hours: Record<number, number> = {};
    bookings.forEach((b) => {
      const h = new Date(b.startTime).getHours();
      hours[h] = (hours[h] ?? 0) + 1;
    });
    return Array.from({ length: 24 }, (_, i) => ({ hour: i, count: hours[i] ?? 0 }))
      .filter((h) => h.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [bookings]);

  const ticketSla = useMemo(() => {
    const resolved = tickets.filter(
      (t) => t.status === 'RESOLVED' || t.status === 'CLOSED',
    );
    if (resolved.length === 0) return null;
    const totalHours =
      resolved.reduce((sum, t) => {
        const ms = new Date(t.updatedAt).getTime() - new Date(t.createdAt).getTime();
        return sum + ms / 3_600_000;
      }, 0) / resolved.length;
    const byPriority: Record<string, number[]> = {};
    resolved.forEach((t) => {
      const h = (new Date(t.updatedAt).getTime() - new Date(t.createdAt).getTime()) / 3_600_000;
      if (!byPriority[t.priority]) byPriority[t.priority] = [];
      byPriority[t.priority].push(h);
    });
    const avgByPriority = Object.entries(byPriority).map(([priority, hrs]) => ({
      priority,
      avg: hrs.reduce((s, v) => s + v, 0) / hrs.length,
    }));
    return { overall: totalHours, byPriority: avgByPriority };
  }, [tickets]);

  return (
    <div className="page-grid dashboard-page">
      <section className="hero-card dashboard-hero">
        <p className="eyebrow">Admin · Analytics</p>
        <h2>Usage Analytics &amp; Insights</h2>
        <p>Campus-wide metrics on bookings, resources, and ticket service levels.</p>
      </section>

      {error ? <p className="error-text">{error}</p> : null}
      {loading ? <p className="empty-state">Loading analytics…</p> : null}

      {!loading && (
        <>
          {/* ── Booking overview ── */}
          <div className="dashboard-stats">
            <DashboardStatCard title="Total Bookings" value={bookingStats.total} description="All-time booking requests" />
            <DashboardStatCard title="Approved" value={bookingStats.approved} description={`${pct(bookingStats.approved, bookingStats.total)} approval rate`} />
            <DashboardStatCard title="Pending Review" value={bookingStats.pending} description="Awaiting admin decision" />
          </div>

          {/* ── Top resources ── */}
          <SectionCard title="Top Booked Resources">
            {topResources.length === 0 ? (
              <p className="empty-state">No booking data yet.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Resource</th>
                    <th>Bookings</th>
                    <th>Share</th>
                  </tr>
                </thead>
                <tbody>
                  {topResources.map((r, i) => (
                    <tr key={r.name}>
                      <td>{i + 1}</td>
                      <td>{r.name}</td>
                      <td>{r.count}</td>
                      <td>{pct(r.count, bookingStats.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </SectionCard>

          {/* ── Peak booking hours ── */}
          <SectionCard title="Peak Booking Hours">
            {peakHours.length === 0 ? (
              <p className="empty-state">No booking time data yet.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Hour (24h)</th>
                    <th>Bookings</th>
                    <th>Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {peakHours.map((h) => (
                    <tr key={h.hour}>
                      <td>{String(h.hour).padStart(2, '0')}:00 – {String(h.hour + 1).padStart(2, '0')}:00</td>
                      <td>{h.count}</td>
                      <td>
                        <div style={{ width: `${pct(h.count, Math.max(...peakHours.map((x) => x.count)))}`, minWidth: '4px', height: '10px', background: 'var(--accent)', borderRadius: '4px' }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </SectionCard>

          {/* ── Ticket overview ── */}
          <div className="dashboard-stats">
            <DashboardStatCard title="Total Tickets" value={ticketStats.total} description="All support tickets raised" />
            <DashboardStatCard title="Open / In-Progress" value={ticketStats.open + ticketStats.inProgress} description="Tickets requiring action" />
            <DashboardStatCard title="Critical / High" value={ticketStats.critical + ticketStats.high} description="High-priority open tickets" />
          </div>

          {/* ── SLA timers ── */}
          <SectionCard title="Ticket Resolution SLA">
            {!ticketSla ? (
              <p className="empty-state">No resolved tickets to measure yet.</p>
            ) : (
              <>
                <p style={{ marginBottom: '0.75rem' }}>
                  Average resolution time across all resolved/closed tickets:{' '}
                  <strong>{hoursLabel(ticketSla.overall)}</strong>
                </p>
                <table>
                  <thead>
                    <tr>
                      <th>Priority</th>
                      <th>Avg. Resolution Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ticketSla.byPriority.map((p) => (
                      <tr key={p.priority}>
                        <td>{p.priority}</td>
                        <td>{hoursLabel(p.avg)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </SectionCard>

          {/* ── Booking status breakdown ── */}
          <SectionCard title="Booking Status Breakdown">
            <table>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Count</th>
                  <th>% of Total</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Approved', val: bookingStats.approved },
                  { label: 'Pending', val: bookingStats.pending },
                  { label: 'Rejected', val: bookingStats.rejected },
                  { label: 'Cancelled', val: bookingStats.cancelled },
                ].map((row) => (
                  <tr key={row.label}>
                    <td>{row.label}</td>
                    <td>{row.val}</td>
                    <td>{pct(row.val, bookingStats.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionCard>
        </>
      )}
    </div>
  );
}
