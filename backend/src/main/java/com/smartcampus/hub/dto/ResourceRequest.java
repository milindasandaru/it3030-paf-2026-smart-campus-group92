package com.smartcampus.hub.dto;

import com.smartcampus.hub.util.ResourceStatus;
import com.smartcampus.hub.util.ResourceType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ResourceRequest(
        @NotBlank String name,
        String description,
        @NotBlank String location,
        @NotNull @Min(1) Integer capacity,
        @NotNull ResourceType type,
        String availabilityWindows,
        @NotNull ResourceStatus status) {}
