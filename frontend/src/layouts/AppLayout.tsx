import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { roleToDashboardPath } from '../services/roleRoutingService';

const links = [
  { to: '/resources', label: 'Resources' },
  { to: '/bookings', label: 'Bookings' },
  { to: '/tickets', label: 'Tickets' },
  { to: '/notifications', label: 'Notifications' },
];

const adminLinks = [
  { to: '/admin', label: 'Admin Panel' },
  { to: '/admin-dashboard', label: 'Admin Dashboard' },
  { to: '/admin/resources', label: 'Manage Resources' },
  { to: '/admin/resources/new', label: 'Add Resource' },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const roleDashboardPath = roleToDashboardPath(user?.role ?? 'STUDENT');

  return (
    <div className="shell">
      <aside className="shell__sidebar">
        <div>
          <p className="eyebrow">Smart Campus</p>
          <h1>Operations Hub</h1>
        </div>
        <nav className="shell__nav">
          <NavLink
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            to={roleDashboardPath}
          >
            Dashboard
          </NavLink>
          {links.map((link) => (
            <NavLink
              key={link.to}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              to={link.to}
            >
              {link.label}
            </NavLink>
          ))}
          {user?.role === 'ADMIN'
            ? adminLinks.map((link) => (
                <NavLink
                  key={link.to}
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                  to={link.to}
                >
                  {link.label}
                </NavLink>
              ))
            : null}
        </nav>
        <div className="shell__user">
          <span>{user?.username}</span>
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
