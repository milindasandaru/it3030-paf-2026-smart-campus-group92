import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/resources', label: 'Resources' },
  { to: '/bookings', label: 'Bookings' },
  { to: '/tickets', label: 'Tickets' },
  { to: '/notifications', label: 'Notifications' },
  { to: '/admin', label: 'Admin Panel' },
];

export function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="shell">
      <aside className="shell__sidebar">
        <div>
          <p className="eyebrow">Smart Campus</p>
          <h1>Operations Hub</h1>
        </div>
        <nav className="shell__nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              to={link.to}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="shell__user">
          <span>{user?.name}</span>
          <small>{user?.role}</small>
          <button className="ghost-button" onClick={logout} type="button">
            Sign out
          </button>
        </div>
      </aside>
      <main className="shell__content">
        <Outlet />
      </main>
    </div>
  );
}
