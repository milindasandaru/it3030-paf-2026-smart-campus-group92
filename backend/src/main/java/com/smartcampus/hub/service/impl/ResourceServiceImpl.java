package com.smartcampus.hub.service.impl;

import com.smartcampus.hub.dto.ResourceRequest;
import com.smartcampus.hub.dto.ResourceResponse;
import com.smartcampus.hub.entity.Resource;
import com.smartcampus.hub.exception.NotFoundException;
import com.smartcampus.hub.mapper.ResourceMapper;
import com.smartcampus.hub.repository.ResourceRepository;
import com.smartcampus.hub.service.ResourceService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;
    private final ResourceMapper resourceMapper;

    @Override
    @Transactional(readOnly = true)
    public List<ResourceResponse> findAll() {
        return resourceRepository.findAll().stream().map(resourceMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ResourceResponse findById(UUID id) {
        return resourceMapper.toResponse(getResource(id));
    }

    @Override
    public ResourceResponse create(ResourceRequest request) {
        Resource resource = resourceMapper.toEntity(request);
        return resourceMapper.toResponse(resourceRepository.save(resource));
    }

    @Override
    public ResourceResponse update(UUID id, ResourceRequest request) {
        Resource resource = getResource(id);
        resourceMapper.update(resource, request);
        return resourceMapper.toResponse(resourceRepository.save(resource));
    }

    @Override
    public void delete(UUID id) {
        resourceRepository.delete(getResource(id));
    }

    private Resource getResource(UUID id) {
        return resourceRepository.findById(id).orElseThrow(() -> new NotFoundException("Resource not found: " + id));
    }
}
