import { SectionCard } from '../components/SectionCard';

export function LecturerDashboardPage() {
  return (
    <div className="page-grid">
      <section className="hero-card">
        <p className="eyebrow">Lecturer dashboard</p>
        <h2>Teaching resources at a glance</h2>
        <p>Track room allocations, upcoming classes, and open support requests in one place.</p>
      </section>

      <SectionCard title="Today for lecturers">
        <ul className="timeline-list">
          <li>Lab 2 reservation starts at 10:00</li>
          <li>Projector issue in South Hall in progress</li>
          <li>2 student resource requests awaiting review</li>
        </ul>
      </SectionCard>
    </div>
  );
}