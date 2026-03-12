import { SectionCard } from '../components/SectionCard';
import { useNotifications } from '../hooks/useNotifications';
import { formatDate } from '../utils/formatDate';

export function NotificationsPanel() {
  const { notifications, loading } = useNotifications();

  return (
    <SectionCard title="Notifications">
      {loading ? <p>Loading updates...</p> : null}
      <div className="notification-list">
        {notifications.map((notification) => (
          <article className="notification-card" key={notification.id}>
            <div>
              <p className="eyebrow">{notification.notificationType}</p>
              <h3>{notification.title}</h3>
              <p>{notification.message}</p>
            </div>
            <span>{formatDate(notification.createdAt)}</span>
          </article>
        ))}
      </div>
    </SectionCard>
  );
}
