import { apiClient } from './client';
import type { NotificationCreateRequest, NotificationItem } from './types';

export async function fetchNotifications(userId: string): Promise<NotificationItem[]> {
  const { data } = await apiClient.get<NotificationItem[]>('/notifications', {
    params: { userId },
  });
  return data;
}

export async function markNotificationAsRead(
  id: string,
  userId: string,
): Promise<NotificationItem> {
  const { data } = await apiClient.put<NotificationItem>(`/notifications/${id}/read`, null, {
    params: { userId },
  });
  return data;
}

export async function createNotification(
  payload: NotificationCreateRequest,
): Promise<NotificationItem> {
  const { data } = await apiClient.post<NotificationItem>('/notifications', payload);
  return data;
}
