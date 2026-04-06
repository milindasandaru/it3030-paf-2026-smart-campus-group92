package com.smartcampus.hub.dto;

import com.smartcampus.hub.util.TicketPriority;
import com.smartcampus.hub.util.TicketStatus;
import java.time.OffsetDateTime;
import java.util.UUID;

public record TicketResponse(
        UUID id,
        String title,
        String description,
        TicketPriority priority,
        TicketStatus status,
        UUID resourceId,
        String resourceName,
        UUID reporterId,
        String reporterName,
        UUID assigneeId,
        String assigneeName,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt) {}
