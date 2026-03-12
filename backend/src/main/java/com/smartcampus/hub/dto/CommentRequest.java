package com.smartcampus.hub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CommentRequest(@NotBlank String message, @NotNull UUID ticketId, @NotNull UUID authorId) {}
