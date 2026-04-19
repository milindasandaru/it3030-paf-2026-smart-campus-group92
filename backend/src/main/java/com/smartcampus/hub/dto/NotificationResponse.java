package com.smartcampus.hub.dto;

import com.smartcampus.hub.util.NotificationType;
import java.time.OffsetDateTime;
import java.util.UUID;

public record NotificationResponse(
        UUID id,
        UUID userId,
        String message,
        NotificationType type,
        boolean read,
        OffsetDateTime createdAt) {}
