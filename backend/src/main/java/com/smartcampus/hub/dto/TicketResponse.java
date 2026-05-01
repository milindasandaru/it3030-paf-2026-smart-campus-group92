package com.smartcampus.hub.dto;

import com.smartcampus.hub.util.TicketPriority;
import com.smartcampus.hub.util.TicketStatus;
import java.time.OffsetDateTime;
import java.util.UUID;

public record TicketResponse(
        UUID id,
        String title,
        String description,
        String category,
        String contactDetails,
        TicketPriority priority,
        TicketStatus status,
        String resolutionNotes,
        UUID resourceId,
        String resourceName,
        UUID reporterId,
        String reporterName,
        String reporterEmail,
        UUID assigneeId,
        String assigneeName,
        OffsetDateTime firstResponseAt,
        OffsetDateTime resolvedAt,
        Long firstResponseMinutes,
        Long resolutionMinutes,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt) {}
