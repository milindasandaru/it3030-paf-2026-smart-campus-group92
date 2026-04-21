import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { roleToDashboardPath } from '../services/roleRoutingService';

const links = [
  { to: '/resources', label: 'Resources' },
  { to: '/bookings', label: 'Bookings' },
  { to: '/tickets', label: 'Tickets' },
  { to: '/notifications', label: 'Notifications' },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markRead } = useNotifications();
  const roleDashboardPath = roleToDashboardPath(user?.role ?? 'STUDENT');
  const [openNotifications, setOpenNotifications] = useState(false);

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
          {user?.role === 'ADMIN' ? (
            <NavLink
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              to="/admin"
            >
              Admin Panel
            </NavLink>
          ) : null}
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
        <header className="content-topbar">
          <div className="notification-menu">
            <button
              className="ghost-button"
              onClick={() => setOpenNotifications((current) => !current)}
              type="button"
            >
              Notifications ({unreadCount})
            </button>
            {openNotifications ? (
              <div className="notification-menu__panel">
                {notifications.slice(0, 5).map((notification) => (
                  <article className="notification-menu__item" key={notification.id}>
                    <p>{notification.message}</p>
                    {!notification.read ? (
                      <button
                        className="ghost-button"
                        onClick={() => {
                          void markRead(notification.id);
                        }}
                        type="button"
                      >
                        Mark read
                      </button>
                    ) : null}
                  </article>
                ))}
                {notifications.length === 0 ? <p>No updates.</p> : null}
              </div>
            ) : null}
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
