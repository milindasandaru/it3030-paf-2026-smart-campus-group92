import { NavLink } from 'react-router-dom';
import { SectionCard } from '../components/SectionCard';

const adminActions = [
  'Approve or reject pending bookings',
  'Assign technicians to high-priority incidents',
  'Update campus resource availability rules',
  'Broadcast service notifications',
];

const adminRoutes = [
  { to: '/admin-dashboard', label: 'Open dashboard' },
  { to: '/admin/resources', label: 'Manage resources' },
  { to: '/admin/resources/new', label: 'Create resource' },
];

export function AdminPanel() {
  return (
    <div className="page-grid">
      <section className="hero-card">
        <p className="eyebrow">Admin control room</p>
        <h2>Campus operations hub</h2>
        <p>
          Centralized tools for resource governance, maintenance coordination, and operational
          communication.
        </p>
      </section>

      <SectionCard
        title="Quick access"
        action={
          <div className="admin-quick-links">
            {adminRoutes.map((route) => (
              <NavLink key={route.to} className="ghost-button" to={route.to}>
                {route.label}
              </NavLink>
            ))}
          </div>
        }
      >
        <div className="details-grid">
          <div>
            <p>
              Use these shortcuts to reach the admin dashboard and the full resource CRUD screens.
            </p>
          </div>
          <ul className="timeline-list">
            {adminActions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ul>
        </div>
      </SectionCard>
    </div>
  );
}
