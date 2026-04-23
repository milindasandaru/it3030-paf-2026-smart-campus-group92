package com.smartcampus.hub.dto;

import com.smartcampus.hub.util.ResourceStatus;
import com.smartcampus.hub.util.ResourceType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record ResourceRequest(
        @NotBlank String name,
        String description,
        @NotBlank String location,
        @NotNull @Positive Integer capacity,
        @NotNull ResourceType type,
        String availabilityWindows,
        Integer bookingSlotIntervalMinutes,
        Integer minBookingDurationMinutes,
        Integer maxBookingDurationMinutes,
        Integer minAdvanceBookingMinutes,
        @Min(1) Integer totalUnits,
        @NotNull ResourceStatus status) {}
