package com.smartcampus.hub.service.impl;

import com.smartcampus.hub.dto.ResourceRequest;
import com.smartcampus.hub.dto.ResourceResponse;
import com.smartcampus.hub.entity.Resource;
import com.smartcampus.hub.exception.BusinessException;
import com.smartcampus.hub.exception.NotFoundException;
import com.smartcampus.hub.mapper.ResourceMapper;
import com.smartcampus.hub.repository.BookingRepository;
import com.smartcampus.hub.repository.ResourceRepository;
import com.smartcampus.hub.service.ResourceService;
import com.smartcampus.hub.util.ResourceStatus;
import com.smartcampus.hub.util.ResourceType;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;
    private final BookingRepository bookingRepository;
    private final ResourceMapper resourceMapper;

    @Override
    @Transactional(readOnly = true)
    public List<ResourceResponse> findAll(ResourceType type, Integer capacityMin, String location, ResourceStatus status, String search) {
        Specification<Resource> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (type != null) {
                predicates.add(cb.equal(root.get("type"), type));
            }
            if (capacityMin != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("capacity"), capacityMin));
            }
            if (location != null && !location.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("location"), location));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (search != null && !search.trim().isEmpty()) {
                String likeSearch = "%" + search.toLowerCase() + "%";
                Predicate nameLike = cb.like(cb.lower(root.get("name")), likeSearch);
                Predicate descLike = cb.like(cb.lower(root.get("description")), likeSearch);
                predicates.add(cb.or(nameLike, descLike));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return resourceRepository.findAll(spec).stream().map(resourceMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ResourceResponse findById(Long id) {
        return resourceMapper.toResponse(getResource(id));
    }

    @Override
    public ResourceResponse create(ResourceRequest request) {
        Resource resource = resourceMapper.toEntity(request);
        return resourceMapper.toResponse(resourceRepository.save(resource));
    }

    @Override
    public ResourceResponse update(Long id, ResourceRequest request) {
        Resource resource = getResource(id);
        resourceMapper.update(resource, request);
        return resourceMapper.toResponse(resourceRepository.save(resource));
    }

    @Override
    public void delete(Long id) {
        Resource resource = getResource(id);
        // Guard: prevent delete if this resource has existing bookings (FK constraint)
        if (!resource.getBookings().isEmpty()) {
            throw new BusinessException(
                    "Cannot delete resource '" + resource.getName()
                            + "': it has " + resource.getBookings().size() + " associated booking(s)."
                            + " Cancel all bookings before deleting the resource.");
        }
        resourceRepository.delete(resource);
    }

    private Resource getResource(Long id) {
        return resourceRepository.findById(id).orElseThrow(() -> new NotFoundException("Resource not found: " + id));
    }
}
