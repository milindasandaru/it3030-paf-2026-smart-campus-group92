package com.smartcampus.hub.dto;

import com.smartcampus.hub.util.ResourceStatus;
import com.smartcampus.hub.util.ResourceType;
import java.time.OffsetDateTime;
import java.util.UUID;

public record ResourceResponse(
        UUID id,
        String name,
        String description,
        String location,
        Integer capacity,
        ResourceType type,
        ResourceStatus status,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt) {}
