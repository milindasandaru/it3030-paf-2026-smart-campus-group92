package com.smartcampus.hub.dto;

import com.smartcampus.hub.util.BookingStatus;
import java.time.OffsetDateTime;
import java.util.UUID;

public record BookingResponse(
        UUID id,
        UUID resourceId,
        UUID userId,
        OffsetDateTime startTime,
        OffsetDateTime endTime,
        Integer attendeeCount,
        String purpose,
        BookingStatus status,
        boolean checkedIn,
        OffsetDateTime checkedInAt,
        String qrPayload) {}
