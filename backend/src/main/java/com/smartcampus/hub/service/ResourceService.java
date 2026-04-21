package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.ResourceRequest;
import com.smartcampus.hub.dto.ResourceResponse;
import com.smartcampus.hub.util.ResourceStatus;
import com.smartcampus.hub.util.ResourceType;
import java.util.List;
import java.util.UUID;

public interface ResourceService {

    List<ResourceResponse> findAll(
            ResourceType type,
            Integer capacityMin,
            Integer capacityMax,
            String location,
            ResourceStatus status,
            String search);

    ResourceResponse findById(UUID id);

    ResourceResponse create(ResourceRequest request);

    ResourceResponse update(UUID id, ResourceRequest request);

    void delete(UUID id);
}
