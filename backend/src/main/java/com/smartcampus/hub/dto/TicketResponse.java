package com.smartcampus.hub.dto;

import com.smartcampus.hub.util.TicketPriority;
import com.smartcampus.hub.util.TicketStatus;
import java.time.LocalDateTime;
import java.util.UUID;

public record TicketResponse(
        UUID id,
        String title,
        String description,
        TicketPriority priority,
        TicketStatus status,
        Long resourceId,
        String resourceName,
        UUID reporterId,
        String reporterName,
        UUID assigneeId,
        String assigneeName,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {}
