import { NotificationPanel } from '../components/NotificationPanel';
import { useNotifications } from '../hooks/useNotifications';

export function NotificationsPanel() {
  const { notifications, loading, error, markRead } = useNotifications();

  return (
    <NotificationPanel
      error={error}
      loading={loading}
      notifications={notifications}
      onMarkRead={(id) => {
        void markRead(id);
      }}
    />
  );
}
