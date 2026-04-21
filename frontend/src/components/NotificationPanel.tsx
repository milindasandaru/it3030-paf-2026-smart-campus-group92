import type { NotificationItem } from '../api/types';
import { formatDate } from '../utils/formatDate';

interface NotificationPanelProps {
  notifications: NotificationItem[];
  loading: boolean;
  error: string | null;
  onMarkRead: (id: string) => void;
}

function iconForType(type: NotificationItem['type']): string {
  if (type === 'BOOKING_APPROVED') {
    return '✅';
  }
  if (type === 'BOOKING_REJECTED') {
    return '❌';
  }
  return '📨';
}

export function NotificationPanel({
  notifications,
  loading,
  error,
  onMarkRead,
}: NotificationPanelProps) {
  return (
    <section className="section-card">
      <header className="section-card__header">
        <h2>Notifications</h2>
      </header>

      {loading ? <p>Loading updates...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
      {!loading && notifications.length === 0 ? (
        <p className="empty-state">No notifications found.</p>
      ) : null}

      <div className="notification-list">
        {notifications.map((notification) => (
          <article className="notification-card" key={notification.id}>
            <div className="notification-card__body">
              <p className="notification-headline">
                {iconForType(notification.type)} {notification.message}
              </p>
              <p className="notification-meta">{formatDate(notification.createdAt)}</p>
            </div>
            {!notification.read ? (
              <button
                className="ghost-button"
                onClick={() => onMarkRead(notification.id)}
                type="button"
              >
                Mark as read
              </button>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
