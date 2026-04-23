package com.smartcampus.hub.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record TicketAssignRequest(@NotNull UUID assigneeId, @NotNull UUID actorUserId) {}
