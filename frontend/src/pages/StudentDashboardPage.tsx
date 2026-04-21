import { SectionCard } from '../components/SectionCard';

export function StudentDashboardPage() {
  return (
    <div className="page-grid">
      <section className="hero-card">
        <p className="eyebrow">Student dashboard</p>
        <h2>Your campus services in one view</h2>
        <p>See bookings, issue tickets, and service updates tailored to your account.</p>
      </section>

      <SectionCard title="Student activity">
        <ul className="timeline-list">
          <li>Library study room booking confirmed for 14:00</li>
          <li>Wi-Fi support ticket updated 20 minutes ago</li>
          <li>New announcement posted by campus administration</li>
        </ul>
      </SectionCard>
    </div>
  );
}
