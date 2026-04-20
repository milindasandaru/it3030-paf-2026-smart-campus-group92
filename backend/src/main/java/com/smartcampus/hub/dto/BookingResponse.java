package com.smartcampus.hub.dto;

import com.smartcampus.hub.util.BookingStatus;
import java.time.OffsetDateTime;
import java.util.UUID;

public record BookingResponse(
        UUID id,
        String title,
        OffsetDateTime startTime,
        OffsetDateTime endTime,
        BookingStatus status,
        Long resourceId,
        String resourceName,
        UUID requesterId,
        String requesterName,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt) {}
