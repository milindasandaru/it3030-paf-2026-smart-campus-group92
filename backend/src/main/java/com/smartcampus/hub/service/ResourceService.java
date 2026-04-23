package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.ResourceRequestDTO;
import com.smartcampus.hub.dto.ResourceResponseDTO;
import com.smartcampus.hub.util.ResourceStatus;
import com.smartcampus.hub.util.ResourceType;
import java.util.List;

public interface ResourceService {

    List<ResourceResponseDTO> findAll(
            ResourceType type, Integer capacityMin, Integer capacityMax, String location, ResourceStatus status, String search);

    ResourceResponseDTO findById(Long id);

    ResourceResponseDTO create(ResourceRequestDTO request);

    ResourceResponseDTO update(Long id, ResourceRequestDTO request);

    void delete(Long id);
}
