package com.smartcampus.hub.dto;

import com.smartcampus.hub.util.ResourceStatus;
import com.smartcampus.hub.util.ResourceType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ResourceRequestDTO(
        @NotBlank @Size(max = 150) String name,
        @NotNull ResourceType type,
        @Size(max = 4000) String description,
        @NotBlank @Size(max = 150) String location,
        @NotNull @Min(1) Integer capacity,
        @NotNull ResourceStatus status,
        @Size(max = 1000) String availabilityWindows) {}