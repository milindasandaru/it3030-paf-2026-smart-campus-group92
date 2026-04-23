package com.smartcampus.hub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CommentUpdateRequest(@NotBlank String message, @NotNull UUID actorUserId) {}
