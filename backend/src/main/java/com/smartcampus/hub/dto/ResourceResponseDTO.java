package com.smartcampus.hub.dto;

import com.smartcampus.hub.util.ResourceStatus;
import com.smartcampus.hub.util.ResourceType;
import java.time.LocalDateTime;

public record ResourceResponseDTO(
        Long id,
        String name,
        ResourceType type,
        String description,
        String location,
        Integer capacity,
        ResourceStatus status,
        String availabilityWindows,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {}