package com.smartcampus.hub.dto;

import com.smartcampus.hub.util.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record NotificationRequest(
        @NotBlank String title,
        @NotBlank String message,
        @NotNull NotificationType notificationType,
        @NotNull UUID recipientId,
        boolean readFlag) {}
