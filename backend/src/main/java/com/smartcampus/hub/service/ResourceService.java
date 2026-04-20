package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.ResourceRequest;
import com.smartcampus.hub.dto.ResourceResponse;
import com.smartcampus.hub.util.ResourceStatus;
import com.smartcampus.hub.util.ResourceType;
import java.util.List;

public interface ResourceService {

    List<ResourceResponse> findAll(ResourceType type, Integer capacityMin, String location, ResourceStatus status, String search);

    ResourceResponse findById(Long id);

    ResourceResponse create(ResourceRequest request);

    ResourceResponse update(Long id, ResourceRequest request);

    void delete(Long id);
}
