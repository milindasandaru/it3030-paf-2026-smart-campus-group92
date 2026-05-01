package com.smartcampus.hub.controller;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.smartcampus.hub.dto.BookingRequest;
import com.smartcampus.hub.entity.Resource;
import com.smartcampus.hub.entity.User;
import com.smartcampus.hub.exception.BusinessException;
import com.smartcampus.hub.mapper.BookingMapper;
import com.smartcampus.hub.repository.BookingRepository;
import com.smartcampus.hub.repository.ResourceRepository;
import com.smartcampus.hub.repository.UserRepository;
import com.smartcampus.hub.service.NotificationService;
import com.smartcampus.hub.service.impl.BookingServiceImpl;
import com.smartcampus.hub.util.Role;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class BookingServiceImplTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private ResourceRepository resourceRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private BookingMapper bookingMapper;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private BookingServiceImpl bookingService;

    @Test
    void createShouldRejectTimeConflict() {
        // resourceId is now Long (Resource PK changed from UUID to Long)
        Long resourceId = 1L;
        UUID requesterId = UUID.randomUUID();
        BookingRequest request = new BookingRequest(
                "Lecture Hall Booking",
                resourceId,
                requesterId,
                OffsetDateTime.now().plusDays(1),
                OffsetDateTime.now().plusDays(1).plusHours(2),
                null,
                null,
                null);

        Resource resource = new Resource();
        resource.setId(resourceId);
        resource.setName("Lecture Hall");

        User requester = new User();
        requester.setId(requesterId);
        requester.setRole(Role.LECTURER);

        when(resourceRepository.findById(resourceId)).thenReturn(Optional.of(resource));
        when(userRepository.findById(requesterId)).thenReturn(Optional.of(requester));
        when(bookingRepository.existsConflict(eq(resourceId), any(), any(), eq(null))).thenReturn(true);

        assertThatThrownBy(() -> bookingService.createBooking(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("conflicts");

        verify(bookingRepository, never()).save(any());
    }

    @Test
    void createShouldPersistWhenNoConflictExists() {
        // resourceId is now Long (Resource PK changed from UUID to Long)
        Long resourceId = 2L;
        UUID requesterId = UUID.randomUUID();
        BookingRequest request = new BookingRequest(
                "Lab Session",
                resourceId,
                requesterId,
                OffsetDateTime.now().plusDays(2),
                OffsetDateTime.now().plusDays(2).plusHours(1),
                null,
                null,
                null);

        Resource resource = new Resource();
        resource.setId(resourceId);
        resource.setName("Computer Lab");

        User user = new User();
        user.setId(requesterId);
        user.setFullName("Alex Johnson");
        user.setRole(Role.LECTURER);

        when(bookingRepository.existsConflict(eq(resourceId), any(), any(), eq(null))).thenReturn(false);
        when(resourceRepository.findById(resourceId)).thenReturn(Optional.of(resource));
        when(userRepository.findById(requesterId)).thenReturn(Optional.of(user));
        when(userRepository.findByRole(Role.ADMIN)).thenReturn(List.of());
        when(bookingRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        bookingService.createBooking(request);

        verify(bookingRepository).save(any());
    }
}
