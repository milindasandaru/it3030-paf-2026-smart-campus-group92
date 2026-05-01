package com.smartcampus.hub.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record AttachmentResponse(
        UUID id,
        String fileName,
        String fileUrl,
        UUID uploadedById,
        String uploadedByName,
        LocalDateTime createdAt) {}