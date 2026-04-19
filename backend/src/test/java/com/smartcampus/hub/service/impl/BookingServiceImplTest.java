package com.smartcampus.hub.service.impl;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.smartcampus.hub.dto.BookingRequest;
import com.smartcampus.hub.entity.Resource;
import com.smartcampus.hub.entity.User;
import com.smartcampus.hub.exception.AccessDeniedException;
import com.smartcampus.hub.exception.ConflictException;
import com.smartcampus.hub.mapper.BookingMapper;
import com.smartcampus.hub.repository.BookingRepository;
import com.smartcampus.hub.repository.ResourceRepository;
import com.smartcampus.hub.repository.UserRepository;
import com.smartcampus.hub.service.NotificationService;
import com.smartcampus.hub.util.NotificationType;
import com.smartcampus.hub.util.ResourceType;
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
    private NotificationService notificationService;

    @Mock
    private BookingMapper bookingMapper;

    @InjectMocks
    private BookingServiceImpl bookingService;

    @Test
    void lecturerBookingLectureHallShouldSucceed() {
        UUID resourceId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        BookingRequest request = new BookingRequest(
                resourceId, userId, OffsetDateTime.now().plusDays(1), OffsetDateTime.now().plusDays(1).plusHours(2));

        Resource lectureHall = resource(resourceId, ResourceType.LECTURE_HALL, null);
        User lecturer = user(userId, Role.LECTURER);
        User admin = user(UUID.randomUUID(), Role.ADMIN);

        when(resourceRepository.findById(resourceId)).thenReturn(Optional.of(lectureHall));
        when(userRepository.findById(userId)).thenReturn(Optional.of(lecturer));
        when(userRepository.findByRole(Role.ADMIN)).thenReturn(List.of(admin));
        when(bookingRepository.existsOverlapping(eq(resourceId), any(), any(), any(), eq(null))).thenReturn(false);
        when(bookingRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        bookingService.createBooking(request);

        verify(bookingRepository).save(any());
        verify(notificationService)
            .createNotification(eq(admin.getId()), eq("Booking request submitted"), eq(NotificationType.BOOKING_CREATED));
    }

    @Test
    void studentBookingLectureHallShouldFail() {
        UUID resourceId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        BookingRequest request = new BookingRequest(
                resourceId, userId, OffsetDateTime.now().plusDays(1), OffsetDateTime.now().plusDays(1).plusHours(2));

        Resource lectureHall = resource(resourceId, ResourceType.LECTURE_HALL, null);
        User student = user(userId, Role.STUDENT);

        when(resourceRepository.findById(resourceId)).thenReturn(Optional.of(lectureHall));
        when(userRepository.findById(userId)).thenReturn(Optional.of(student));

        assertThatThrownBy(() -> bookingService.createBooking(request))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("not allowed");

        verify(bookingRepository, never()).save(any());
    }

    @Test
    void overlappingHallBookingShouldFail() {
        UUID resourceId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        BookingRequest request = new BookingRequest(
                resourceId, userId, OffsetDateTime.now().plusDays(2), OffsetDateTime.now().plusDays(2).plusHours(1));

        Resource lectureHall = resource(resourceId, ResourceType.LECTURE_HALL, null);
        User lecturer = user(userId, Role.LECTURER);

        when(resourceRepository.findById(resourceId)).thenReturn(Optional.of(lectureHall));
        when(userRepository.findById(userId)).thenReturn(Optional.of(lecturer));
        when(bookingRepository.existsOverlapping(eq(resourceId), any(), any(), any(), eq(null))).thenReturn(true);

        assertThatThrownBy(() -> bookingService.createBooking(request))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("conflicts");

        verify(bookingRepository, never()).save(any());
    }

    @Test
    void bookResourceExceedingCopiesShouldFail() {
        UUID resourceId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        BookingRequest request = new BookingRequest(
                resourceId, userId, OffsetDateTime.now().plusDays(3), OffsetDateTime.now().plusDays(3).plusHours(1));

        Resource book = resource(resourceId, ResourceType.BOOK, 2);
        User student = user(userId, Role.STUDENT);

        when(resourceRepository.findById(resourceId)).thenReturn(Optional.of(book));
        when(userRepository.findById(userId)).thenReturn(Optional.of(student));
        when(bookingRepository.countOverlapping(eq(resourceId), any(), any(), any())).thenReturn(2L);

        assertThatThrownBy(() -> bookingService.createBooking(request))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("no available copies");

        verify(bookingRepository, never()).save(any());
    }

    @Test
    void validBookBookingShouldPass() {
        UUID resourceId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        BookingRequest request = new BookingRequest(
                resourceId, userId, OffsetDateTime.now().plusDays(4), OffsetDateTime.now().plusDays(4).plusHours(1));

        Resource book = resource(resourceId, ResourceType.BOOK, 3);
        User lecturer = user(userId, Role.LECTURER);
        User admin = user(UUID.randomUUID(), Role.ADMIN);

        when(resourceRepository.findById(resourceId)).thenReturn(Optional.of(book));
        when(userRepository.findById(userId)).thenReturn(Optional.of(lecturer));
        when(userRepository.findByRole(Role.ADMIN)).thenReturn(List.of(admin));
        when(bookingRepository.countOverlapping(eq(resourceId), any(), any(), any())).thenReturn(1L);
        when(bookingRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        bookingService.createBooking(request);

        verify(bookingRepository).save(any());
        verify(notificationService)
            .createNotification(eq(admin.getId()), eq("Booking request submitted"), eq(NotificationType.BOOKING_CREATED));
    }

    private static Resource resource(UUID resourceId, ResourceType type, Integer totalUnits) {
        Resource resource = new Resource();
        resource.setId(resourceId);
        resource.setName("Resource");
        resource.setType(type);
        resource.setTotalUnits(totalUnits);
        return resource;
    }

    private static User user(UUID userId, Role role) {
        User user = new User();
        user.setId(userId);
        user.setRole(role);
        return user;
    }
}
