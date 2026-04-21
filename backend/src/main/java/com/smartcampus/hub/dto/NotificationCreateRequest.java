package com.smartcampus.hub.dto;

import com.smartcampus.hub.util.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record NotificationCreateRequest(
        @NotNull UUID userId,
        @NotBlank String message,
        @NotNull NotificationType type) {}
