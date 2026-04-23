package com.smartcampus.hub.dto;

import com.smartcampus.hub.util.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record TicketUpdateDetailsRequest(
        @NotBlank @Size(max = 150) String title,
        @NotBlank String description,
        @NotBlank @Size(max = 64) String category,
        @Size(max = 255) String contactDetails,
        @NotNull TicketPriority priority,
        UUID resourceId,
        @NotNull UUID actorUserId) {}
