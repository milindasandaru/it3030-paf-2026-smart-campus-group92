package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.ResourceRequest;
import com.smartcampus.hub.dto.ResourceResponse;
import java.util.List;
import java.util.UUID;

public interface ResourceService {

    List<ResourceResponse> findAll();

    ResourceResponse findById(UUID id);

    ResourceResponse create(ResourceRequest request);

    ResourceResponse update(UUID id, ResourceRequest request);

    void delete(UUID id);
}
