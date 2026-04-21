package com.smartcampus.hub.dto;

import com.smartcampus.hub.util.NotificationType;
import java.time.LocalDateTime;
import java.util.UUID;

public record NotificationResponse(
        UUID id,
        UUID userId,
        String message,
        NotificationType notificationType,
        boolean readFlag,
        LocalDateTime createdAt) {}
