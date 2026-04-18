package com.smartcampus.hub.dto;

import com.smartcampus.hub.util.BookingStatus;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;
import java.util.UUID;

public record BookingRequest(
        @NotBlank String title,
        @NotNull UUID resourceId,
        @NotNull UUID requesterId,
        @NotNull @Future OffsetDateTime startTime,
        @NotNull @Future OffsetDateTime endTime,
        @NotNull BookingStatus status) {}
