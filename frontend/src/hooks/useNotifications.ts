import { useEffect, useState } from 'react';
import { fetchNotifications } from '../api/notificationsApi';
import type { NotificationItem } from '../api/types';

const fallbackNotifications: NotificationItem[] = [
  {
    id: 'n-1',
    title: 'Ticket escalated',
    message: 'Air conditioning ticket moved to high priority.',
    notificationType: 'ALERT',
    readFlag: false,
    createdAt: new Date().toISOString(),
  },
];

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadNotifications() {
      try {
        const data = await fetchNotifications();
        if (active) {
          setNotifications(data);
        }
      } catch {
        if (active) {
          setNotifications(fallbackNotifications);
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
  }, []);

  return { notifications, loading };
}
