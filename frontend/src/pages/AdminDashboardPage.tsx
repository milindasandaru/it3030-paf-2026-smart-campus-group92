import { SectionCard } from '../components/SectionCard';

export function AdminDashboardPage() {
  return (
    <div className="page-grid">
      <section className="hero-card">
        <p className="eyebrow">Admin dashboard</p>
        <h2>Campus-wide operational control</h2>
        <p>Review approvals, monitor service health, and coordinate cross-team actions.</p>
      </section>

      <SectionCard title="Admin quick view">
        <ul className="timeline-list">
          <li>12 pending booking approvals</li>
          <li>3 high-priority maintenance incidents</li>
          <li>2 policy notifications scheduled today</li>
        </ul>
      </SectionCard>
    </div>
  );
}
