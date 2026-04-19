package com.smartcampus.hub.dto;

import com.smartcampus.hub.util.BookingStatus;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;
import java.util.UUID;

public record BookingRequest(
        @NotNull UUID resourceId,
        @NotNull UUID userId,
        @NotNull @Future OffsetDateTime startTime,
                @NotNull @Future OffsetDateTime endTime,
                BookingStatus status) {

        public BookingRequest(UUID resourceId, UUID userId, OffsetDateTime startTime, OffsetDateTime endTime) {
                this(resourceId, userId, startTime, endTime, null);
        }
}
