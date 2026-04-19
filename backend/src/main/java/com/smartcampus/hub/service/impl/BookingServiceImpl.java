package com.smartcampus.hub.service.impl;

import com.smartcampus.hub.dto.BookingRequest;
import com.smartcampus.hub.dto.BookingResponse;
import com.smartcampus.hub.entity.Booking;
import com.smartcampus.hub.entity.Resource;
import com.smartcampus.hub.entity.User;
import com.smartcampus.hub.exception.AccessDeniedException;
import com.smartcampus.hub.exception.BusinessException;
import com.smartcampus.hub.exception.ConflictException;
import com.smartcampus.hub.exception.NotFoundException;
import com.smartcampus.hub.mapper.BookingMapper;
import com.smartcampus.hub.repository.BookingRepository;
import com.smartcampus.hub.repository.ResourceRepository;
import com.smartcampus.hub.repository.UserRepository;
import com.smartcampus.hub.service.BookingService;
import com.smartcampus.hub.service.NotificationService;
import com.smartcampus.hub.util.BookingStatus;
import com.smartcampus.hub.util.NotificationType;
import com.smartcampus.hub.util.ResourceType;
import com.smartcampus.hub.util.Role;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final BookingMapper bookingMapper;

    private static final List<BookingStatus> ACTIVE_BOOKING_STATUSES =
            List.of(BookingStatus.PENDING, BookingStatus.APPROVED);

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> findAll() {
        return bookingRepository.findAll().stream().map(bookingMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse findById(UUID id) {
        return bookingMapper.toResponse(getBooking(id));
    }

    @Override
    public BookingResponse createBooking(BookingRequest request) {
        return create(request);
    }

    @Override
    public BookingResponse create(BookingRequest request) {
        Resource resource = getResource(request.resourceId());
        User requester = getUser(request.userId());

        validateRoleAccess(resource.getType(), requester.getRole());
        validateTimeRange(request.startTime(), request.endTime());
        validateConflicts(resource, request.startTime(), request.endTime(), null);

        Booking booking = new Booking();
        applyRequest(booking, request, resource, requester);
        booking.setStatus(BookingStatus.PENDING);

        Booking saved = bookingRepository.save(booking);
        notifyAdminsBookingCreated();
        return bookingMapper.toResponse(saved);
    }

    @Override
    public BookingResponse update(UUID id, BookingRequest request) {
        Resource resource = getResource(request.resourceId());
        User requester = getUser(request.userId());

        validateRoleAccess(resource.getType(), requester.getRole());
        validateTimeRange(request.startTime(), request.endTime());
        validateConflicts(resource, request.startTime(), request.endTime(), id);

        Booking booking = getBooking(id);
        BookingStatus previousStatus = booking.getStatus();
        applyRequest(booking, request, resource, requester);
        Booking saved = bookingRepository.save(booking);
        notifyBookingDecision(saved, previousStatus);
        return bookingMapper.toResponse(saved);
    }

    @Override
    public void delete(UUID id) {
        bookingRepository.delete(getBooking(id));
    }

    private void applyRequest(Booking booking, BookingRequest request, Resource resource, User requester) {
        booking.setTitle("Booking request submitted");
        booking.setResource(resource);
        booking.setRequester(requester);
        booking.setStartTime(request.startTime());
        booking.setEndTime(request.endTime());
        if (request.status() != null) {
            booking.setStatus(request.status());
        }
    }

    private void validateRoleAccess(ResourceType type, Role role) {
        boolean allowed = switch (type) {
            case LECTURE_HALL, LAB -> role == Role.LECTURER;
            case BOOK -> role == Role.LECTURER || role == Role.STUDENT;
            case STUDY_AREA -> role == Role.LECTURER || role == Role.STUDENT;
        };

        if (!allowed) {
            throw new AccessDeniedException("User role is not allowed to book this resource type");
        }
    }

    private void validateTimeRange(OffsetDateTime startTime, OffsetDateTime endTime) {
        if (!startTime.isBefore(endTime)) {
            throw new BusinessException("Booking end time must be after start time");
        }
    }

    private void validateConflicts(Resource resource, OffsetDateTime startTime, OffsetDateTime endTime, UUID excludeId) {
        ResourceType type = resource.getType();
        if (type == ResourceType.BOOK) {
            int totalUnits = resource.getTotalUnits() == null ? 0 : resource.getTotalUnits();
            if (totalUnits <= 0) {
                throw new ConflictException("Book resource must define totalUnits greater than zero");
            }

            long activeBookings = bookingRepository.countOverlapping(
                    resource.getId(), startTime, endTime, ACTIVE_BOOKING_STATUSES);
            if (activeBookings >= totalUnits) {
                throw new ConflictException("Book resource has no available copies for the selected time range");
            }
            return;
        }

        boolean conflict = bookingRepository.existsOverlapping(
                resource.getId(), startTime, endTime, ACTIVE_BOOKING_STATUSES, excludeId);
        if (conflict) {
            throw new ConflictException("Booking request conflicts with an existing reservation");
        }
    }

    private void notifyAdminsBookingCreated() {
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        for (User admin : admins) {
            notificationService.createNotification(
                    admin.getId(), "Booking request submitted", NotificationType.BOOKING_CREATED);
        }
    }

    private void notifyBookingDecision(Booking booking, BookingStatus previousStatus) {
        BookingStatus currentStatus = booking.getStatus();
        if (currentStatus == previousStatus) {
            return;
        }

        if (currentStatus == BookingStatus.APPROVED) {
            notificationService.createNotification(
                    booking.getRequester().getId(),
                    "Your booking was approved",
                    NotificationType.BOOKING_APPROVED);
            return;
        }

        if (currentStatus == BookingStatus.REJECTED) {
            notificationService.createNotification(
                    booking.getRequester().getId(),
                    "Your booking was rejected",
                    NotificationType.BOOKING_REJECTED);
        }
    }

    private Resource getResource(UUID id) {
        return resourceRepository.findById(id).orElseThrow(() -> new NotFoundException("Resource not found: " + id));
    }

    private User getUser(UUID id) {
        return userRepository.findById(id).orElseThrow(() -> new NotFoundException("User not found: " + id));
    }

    private Booking getBooking(UUID id) {
        return bookingRepository.findById(id).orElseThrow(() -> new NotFoundException("Booking not found: " + id));
    }
}
