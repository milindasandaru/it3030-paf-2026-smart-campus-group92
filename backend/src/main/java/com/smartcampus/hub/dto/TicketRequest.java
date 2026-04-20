package com.smartcampus.hub.dto;

import com.smartcampus.hub.util.TicketPriority;
import com.smartcampus.hub.util.TicketStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record TicketRequest(
        @NotBlank String title,
        @NotBlank String description,
        Long resourceId,
        @NotNull UUID reporterId,
        UUID assigneeId,
        @NotNull TicketPriority priority,
        @NotNull TicketStatus status) {}
