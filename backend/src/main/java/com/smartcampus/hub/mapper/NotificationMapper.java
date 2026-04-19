package com.smartcampus.hub.mapper;

import com.smartcampus.hub.dto.NotificationResponse;
import com.smartcampus.hub.entity.Notification;
import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {

    public NotificationResponse toResponse(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getRecipient().getId(),
                notification.getMessage(),
                notification.getNotificationType(),
                notification.isReadFlag(),
                notification.getCreatedAt());
    }
}
