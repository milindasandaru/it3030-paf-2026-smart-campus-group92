import { useEffect, useState } from 'react';
import { fetchNotifications, markNotificationAsRead } from '../api/notificationsApi';
import type { NotificationItem } from '../api/types';
import { useAuth } from './useAuth';

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadNotifications() {
      if (!user?.userId) {
        if (active) {
          setNotifications([]);
          setLoading(false);
        }
        return;
      }

      try {
        const data = await fetchNotifications(user.userId);
        if (active) {
          setNotifications(data);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load notifications');
          setNotifications([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadNotifications();

    return () => {
      active = false;
    };
  }, [user?.userId]);

  async function markRead(notificationId: string) {
    if (!user?.userId) {
      return;
    }

    const updated = await markNotificationAsRead(notificationId, user.userId);
    setNotifications((current) =>
      current.map((item) => (item.id === notificationId ? updated : item)),
    );
  }

  const unreadCount = notifications.filter((item) => !item.read).length;

  return { notifications, loading, unreadCount, error, markRead };
}
