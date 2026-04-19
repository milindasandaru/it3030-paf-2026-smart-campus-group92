package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.NotificationResponse;
import com.smartcampus.hub.util.NotificationType;
import java.util.List;
import java.util.UUID;

public interface NotificationService {

    NotificationResponse createNotification(UUID userId, String message, NotificationType type);

    List<NotificationResponse> getMyNotifications();

    NotificationResponse markAsRead(UUID id);
}
