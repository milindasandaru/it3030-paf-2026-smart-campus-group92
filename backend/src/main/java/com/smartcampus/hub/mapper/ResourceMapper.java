package com.smartcampus.hub.mapper;

import com.smartcampus.hub.dto.ResourceRequestDTO;
import com.smartcampus.hub.dto.ResourceResponseDTO;
import com.smartcampus.hub.entity.Resource;
import org.springframework.stereotype.Component;

@Component
public class ResourceMapper {

    public Resource toEntity(ResourceRequestDTO request) {
        Resource resource = new Resource();
        update(resource, request);
        return resource;
    }

    public void update(Resource resource, ResourceRequestDTO request) {
        resource.setName(request.name());
        resource.setType(request.type());
        resource.setDescription(request.description());
        resource.setLocation(request.location());
        resource.setCapacity(request.capacity());
        resource.setType(request.type());
        resource.setAvailabilityWindows(request.availabilityWindows());
        resource.setBookingSlotIntervalMinutes(request.bookingSlotIntervalMinutes());
        resource.setMinBookingDurationMinutes(request.minBookingDurationMinutes());
        resource.setMaxBookingDurationMinutes(request.maxBookingDurationMinutes());
        resource.setMinAdvanceBookingMinutes(request.minAdvanceBookingMinutes());
        resource.setTotalUnits(request.totalUnits());
        resource.setStatus(request.status());
        resource.setAvailabilityWindows(request.availabilityWindows());
    }

    public ResourceResponseDTO toResponse(Resource resource) {
        return new ResourceResponseDTO(
                resource.getId(),
                resource.getName(),
                resource.getType(),
                resource.getDescription(),
                resource.getLocation(),
                resource.getCapacity(),
                resource.getType(),
                resource.getAvailabilityWindows(),
                resource.getBookingSlotIntervalMinutes(),
                resource.getMinBookingDurationMinutes(),
                resource.getMaxBookingDurationMinutes(),
                resource.getMinAdvanceBookingMinutes(),
                resource.getTotalUnits(),
                resource.getStatus(),
                resource.getAvailabilityWindows(),
                resource.getCreatedAt(),
                resource.getUpdatedAt());
    }
}
