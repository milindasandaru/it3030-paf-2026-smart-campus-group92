package com.smartcampus.hub.dto;

import com.smartcampus.hub.util.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record TicketCreateRequest(
        @NotBlank String title,
        @NotBlank String description,
        @NotBlank String category,
        String contactDetails,
        @NotNull TicketPriority priority,
        UUID resourceId,
        @NotNull UUID reporterId) {}
