package com.smartcampus.hub.mapper;

import com.smartcampus.hub.dto.ResourceRequest;
import com.smartcampus.hub.dto.ResourceResponse;
import com.smartcampus.hub.entity.Resource;
import org.springframework.stereotype.Component;

@Component
public class ResourceMapper {

    public Resource toEntity(ResourceRequest request) {
        Resource resource = new Resource();
        update(resource, request);
        return resource;
    }

    public void update(Resource resource, ResourceRequest request) {
        resource.setName(request.name());
        resource.setDescription(request.description());
        resource.setLocation(request.location());
        resource.setCapacity(request.capacity());
        resource.setStatus(request.status());
    }

    public ResourceResponse toResponse(Resource resource) {
        return new ResourceResponse(
                resource.getId(),
                resource.getName(),
                resource.getDescription(),
                resource.getLocation(),
                resource.getCapacity(),
                resource.getType(),
                resource.getStatus(),
                resource.getCreatedAt(),
                resource.getUpdatedAt());
    }
}
