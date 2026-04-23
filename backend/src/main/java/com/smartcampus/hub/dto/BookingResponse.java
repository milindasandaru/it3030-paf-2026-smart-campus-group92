package com.smartcampus.hub.dto;

import com.smartcampus.hub.util.BookingStatus;
import java.time.OffsetDateTime;
import java.time.LocalDateTime;
import java.util.UUID;

public record BookingResponse(
        UUID id,
        OffsetDateTime startTime,
        OffsetDateTime endTime,
        Integer attendeeCount,
        String purpose,
        BookingStatus status,
        Long resourceId,
        String resourceName,
        UUID requesterId,
        String requesterName,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {}
