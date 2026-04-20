package com.smartcampus.hub.dto;

import com.smartcampus.hub.util.ResourceStatus;
import com.smartcampus.hub.util.ResourceType;
import java.time.OffsetDateTime;

public record ResourceResponse(
        Long id,
        String name,
        ResourceType type,
        String description,
        String location,
        Integer capacity,
        ResourceStatus status,
        String availabilityWindows,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt) {}
