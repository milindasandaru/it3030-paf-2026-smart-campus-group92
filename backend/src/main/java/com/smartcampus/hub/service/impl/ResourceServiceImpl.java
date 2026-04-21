package com.smartcampus.hub.service.impl;

import com.smartcampus.hub.dto.ResourceRequest;
import com.smartcampus.hub.dto.ResourceResponse;
import com.smartcampus.hub.entity.Resource;
import com.smartcampus.hub.exception.NotFoundException;
import com.smartcampus.hub.mapper.ResourceMapper;
import com.smartcampus.hub.repository.ResourceRepository;
import com.smartcampus.hub.service.ResourceService;
import com.smartcampus.hub.util.ResourceStatus;
import com.smartcampus.hub.util.ResourceType;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
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
    public List<ResourceResponse> findAll(
            ResourceType type,
            Integer capacityMin,
            Integer capacityMax,
            String location,
            ResourceStatus status,
            String search) {
        Specification<Resource> specification = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (type != null) {
                predicates.add(criteriaBuilder.equal(root.get("type"), type));
            }

            if (capacityMin != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("capacity"), capacityMin));
            }

            if (capacityMax != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("capacity"), capacityMax));
            }

            if (location != null && !location.isBlank()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("location")),
                        "%" + location.toLowerCase() + "%"));
            }

            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }

            if (search != null && !search.isBlank()) {
                String normalizedSearch = "%" + search.toLowerCase() + "%";
                Predicate namePredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), normalizedSearch);
                Predicate descriptionPredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(criteriaBuilder.coalesce(root.get("description"), "")), normalizedSearch);
                predicates.add(criteriaBuilder.or(namePredicate, descriptionPredicate));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        return resourceRepository.findAll(specification).stream().map(resourceMapper::toResponse).toList();
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
