import { SectionCard } from '../components/SectionCard';

const adminActions = [
  'Approve or reject pending bookings',
  'Assign technicians to high-priority incidents',
  'Update campus resource availability rules',
  'Broadcast service notifications',
];

export function AdminPanel() {
  return (
    <SectionCard title="Admin control room">
      <div className="details-grid">
        <div>
          <p>
            Centralized tools for resource governance, maintenance coordination, and operational
            communication.
          </p>
        </div>
        <ul className="timeline-list">
          {adminActions.map((action) => (
            <li key={action}>{action}</li>
          ))}
        </ul>
      </div>
    </SectionCard>
  );
}
