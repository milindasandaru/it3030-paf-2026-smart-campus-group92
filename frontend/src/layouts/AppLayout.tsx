import { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import type { UserRole } from '../api/types';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { useTheme } from '../context/ThemeContext';

interface NavItem {
  to: string;
  label: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAVIGATION_BY_ROLE: Record<UserRole, NavSection[]> = {
  ADMIN: [
    {
      title: 'Overview',
      items: [{ to: '/admin-dashboard', label: 'Dashboard' }],
    },
    {
      title: 'Workspace',
      items: [
        { to: '/resources', label: 'Resources' },
        { to: '/bookings', label: 'Bookings' },
        { to: '/tickets', label: 'Tickets' },
      ],
    },
    {
      title: 'Administration',
      items: [
        { to: '/admin', label: 'Admin Panel' },
        { to: '/admin/analytics', label: 'Analytics' },
      ],
    },
    {
      title: 'Settings',
      items: [
        { to: '/profile', label: 'My Profile' },
        { to: '/notification-preferences', label: 'Notification Prefs' },
      ],
    },
  ],
  TECHNICIAN: [
    {
      title: 'Workspace',
      items: [
        { to: '/technician-dashboard', label: 'Dashboard' },
        { to: '/tickets', label: 'Assigned Tickets' },
      ],
    },
    {
      title: 'Settings',
      items: [
        { to: '/profile', label: 'My Profile' },
        { to: '/notification-preferences', label: 'Notification Prefs' },
      ],
    },
  ],
  LECTURER: [
    {
      title: 'Workspace',
      items: [
        { to: '/lecturer-dashboard', label: 'Dashboard' },
        { to: '/bookings', label: 'Bookings' },
        { to: '/tickets', label: 'Tickets' },
      ],
    },
    {
      title: 'Settings',
      items: [
        { to: '/profile', label: 'My Profile' },
        { to: '/notification-preferences', label: 'Notification Prefs' },
      ],
    },
  ],
  STUDENT: [
    {
      title: 'Workspace',
      items: [
        { to: '/student-dashboard', label: 'Dashboard' },
        { to: '/bookings', label: 'Bookings' },
        { to: '/tickets', label: 'Tickets' },
      ],
    },
    {
      title: 'Settings',
      items: [
        { to: '/profile', label: 'My Profile' },
        { to: '/notification-preferences', label: 'Notification Prefs' },
      ],
    },
  ],
  STAFF: [
    {
      title: 'Workspace',
      items: [
        { to: '/student-dashboard', label: 'Dashboard' },
        { to: '/bookings', label: 'Bookings' },
        { to: '/tickets', label: 'Tickets' },
      ],
    },
    {
      title: 'Settings',
      items: [
        { to: '/profile', label: 'My Profile' },
        { to: '/notification-preferences', label: 'Notification Prefs' },
      ],
    },
  ],
};


export function AppLayout() {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, loading, error, markRead } = useNotifications();
  const { theme, toggleTheme } = useTheme();
  const [openNotifications, setOpenNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const notificationMenuRef = useRef<HTMLDivElement | null>(null);

  const role = user?.role ?? 'STUDENT';
  const navigation = NAVIGATION_BY_ROLE[role];

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!openNotifications) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!notificationMenuRef.current?.contains(event.target as Node)) {
        setOpenNotifications(false);
      }
    };

    window.addEventListener('mousedown', handlePointerDown);
    return () => window.removeEventListener('mousedown', handlePointerDown);
  }, [openNotifications]);

  const formattedTime = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }).format(currentTime),
    [currentTime],
  );

  return (
    <div className="shell">
      <aside className="shell__sidebar">
        <div className="shell__brand">
          <p className="eyebrow">Smart Campus</p>
          <h1>Operations Hub</h1>
          <p className="shell__brand-copy">
            Role-based operations, bookings, and support workflows.
          </p>
        </div>

        <nav className="shell__nav" aria-label="Sidebar navigation">
          {navigation.map((section) => (
            <section className="nav-section" key={section.title}>
              <p className="nav-section__title">{section.title}</p>
              <div className="nav-section__items">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                    to={item.to}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </section>
          ))}
        </nav>

        <div className="shell__user">
          <span className="shell__user-name">{user?.username}</span>
          <small className="shell__user-role">{user?.role}</small>
          <button className="ghost-button" onClick={logout} type="button">
            Sign out
          </button>
        </div>
      </aside>

      <main className="shell__content">
        <header className="content-topbar">
          <div className="content-topbar__brand">
            <strong>Smart Campus</strong>
          </div>

          <div className="content-topbar__meta">
            <span className="topbar-chip">{formattedTime}</span>
            <NavLink
              to="/profile"
              title="My Profile"
              style={({ isActive }) => ({
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                overflow: 'hidden',
                background: isActive ? 'var(--accent)' : 'var(--accent-soft)',
                border: '2px solid var(--accent)',
                fontWeight: 700,
                color: isActive ? '#fff' : 'var(--accent)',
                fontSize: '0.85rem',
                textDecoration: 'none',
                flexShrink: 0,
              })}
            >
              {user?.username?.slice(0, 2).toUpperCase() ?? '??'}
            </NavLink>

            <button
              className="theme-toggle"
              type="button"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            <div className="notification-menu" ref={notificationMenuRef}>
              <button
                className="notification-trigger"
                onClick={() => setOpenNotifications((current) => !current)}
                type="button"
              >
                <span className="notification-trigger__label">Notifications</span>
                <span className="notification-trigger__count">{unreadCount}</span>
              </button>

              {openNotifications ? (
                <div className="notification-menu__panel">
                  <div className="notification-menu__header">
                    <strong>Recent notifications</strong>
                    <small>{unreadCount} unread</small>
                  </div>

                  {loading ? <p className="empty-state">Loading updates...</p> : null}
                  {error ? <p className="error-text">{error}</p> : null}
                  {!loading && notifications.length === 0 ? (
                    <p className="empty-state">No notifications yet.</p>
                  ) : null}

                  <div className="notification-menu__list">
                    {notifications.map((notification) => (
                      <article
                        className={
                          notification.read
                            ? 'notification-menu__item'
                            : 'notification-menu__item notification-menu__item--unread'
                        }
                        key={notification.id}
                      >
                        <div className="notification-menu__copy">
                          <p>{notification.message}</p>
                          <small>
                            {new Intl.DateTimeFormat('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            }).format(new Date(notification.createdAt))}
                          </small>
                        </div>

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
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <div className="shell__body">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
