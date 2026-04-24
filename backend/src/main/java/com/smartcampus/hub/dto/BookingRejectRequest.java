package com.smartcampus.hub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record BookingRejectRequest(@NotNull UUID actorUserId, @NotBlank String reason) {}