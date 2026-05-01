package com.smartcampus.hub.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.smartcampus.hub.dto.ResourceRequestDTO;
import com.smartcampus.hub.dto.ResourceResponseDTO;
import com.smartcampus.hub.entity.Resource;
import com.smartcampus.hub.exception.BusinessException;
import com.smartcampus.hub.mapper.ResourceMapper;
import com.smartcampus.hub.repository.BookingRepository;
import com.smartcampus.hub.repository.ResourceRepository;
import com.smartcampus.hub.util.ResourceStatus;
import com.smartcampus.hub.util.ResourceType;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ResourceServiceImplTest {

    @Mock
    private ResourceRepository resourceRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private ResourceMapper resourceMapper;

    @InjectMocks
    private ResourceServiceImpl resourceService;

    @Test
    void findAllShouldReturnMappedFilteredResources() {
        Resource resource = new Resource();
        resource.setId(7L);
        resource.setName("Innovation Lab");
        resource.setType(ResourceType.LAB);
        resource.setLocation("Building A");
        resource.setCapacity(40);
        resource.setStatus(ResourceStatus.ACTIVE);

        ResourceResponseDTO response = new ResourceResponseDTO(
                7L,
                "Innovation Lab",
                ResourceType.LAB,
                null,
                "Building A",
                40,
                ResourceStatus.ACTIVE,
                "Mon-Fri 08:00-17:00",
                LocalDateTime.of(2026, 4, 21, 10, 0),
                LocalDateTime.of(2026, 4, 21, 10, 5));

        when(resourceRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class))).thenReturn(List.of(resource));
        when(resourceMapper.toResponse(resource)).thenReturn(response);

        List<ResourceResponseDTO> results = resourceService.findAll(ResourceType.LAB, 30, 50, "Building", ResourceStatus.ACTIVE, "innovation");

        assertThat(results).hasSize(1);
        assertThat(results.getFirst().name()).isEqualTo("Innovation Lab");
    }

    @Test
    void findAllShouldRejectInvalidCapacityRange() {
        assertThatThrownBy(() -> resourceService.findAll(ResourceType.LAB, 50, 20, null, null, null))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("capacityMax");
    }

    @Test
    void createShouldPersistMappedResource() {
        ResourceRequestDTO request = new ResourceRequestDTO(
                "Innovation Lab",
                ResourceType.LAB,
                "High-spec lab",
                "Building A",
                40,
                ResourceStatus.ACTIVE,
                "Mon-Fri 08:00-17:00");

        Resource mapped = new Resource();
        mapped.setName("Innovation Lab");
        ResourceResponseDTO response = new ResourceResponseDTO(
                1L,
                "Innovation Lab",
                ResourceType.LAB,
                "High-spec lab",
                "Building A",
                40,
                ResourceStatus.ACTIVE,
                "Mon-Fri 08:00-17:00",
                LocalDateTime.of(2026, 4, 21, 10, 0),
                LocalDateTime.of(2026, 4, 21, 10, 5));

        when(resourceMapper.toEntity(request)).thenReturn(mapped);
        when(resourceRepository.save(mapped)).thenReturn(mapped);
        when(resourceMapper.toResponse(mapped)).thenReturn(response);

        ResourceResponseDTO created = resourceService.create(request);

        ArgumentCaptor<Resource> captor = ArgumentCaptor.forClass(Resource.class);
        verify(resourceRepository).save(captor.capture());
        assertThat(captor.getValue().getName()).isEqualTo("Innovation Lab");
        assertThat(created.id()).isEqualTo(1L);
    }

    @Test
    void deleteShouldRejectResourcesWithBookings() {
        Resource resource = new Resource();
        resource.setId(1L);
        resource.setName("Lecture Hall 1");
        resource.setBookings(List.of(new com.smartcampus.hub.entity.Booking()));

        when(resourceRepository.findById(1L)).thenReturn(Optional.of(resource));

        assertThatThrownBy(() -> resourceService.delete(1L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("associated booking");

        verify(resourceRepository, never()).delete(org.mockito.ArgumentMatchers.<Resource>any());
    }
}