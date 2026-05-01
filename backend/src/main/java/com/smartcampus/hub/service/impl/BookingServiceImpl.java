package com.smartcampus.hub.service.impl;

import com.smartcampus.hub.dto.BookingRequest;
import com.smartcampus.hub.dto.BookingResponse;
import com.smartcampus.hub.entity.Booking;
import com.smartcampus.hub.entity.Resource;
import com.smartcampus.hub.entity.User;
import com.smartcampus.hub.exception.AccessDeniedException;
import com.smartcampus.hub.exception.BusinessException;
import com.smartcampus.hub.exception.NotFoundException;
import com.smartcampus.hub.mapper.BookingMapper;
import com.smartcampus.hub.repository.BookingRepository;
import com.smartcampus.hub.repository.ResourceRepository;
import com.smartcampus.hub.repository.UserRepository;
import com.smartcampus.hub.service.BookingService;
import com.smartcampus.hub.service.NotificationService;
import com.smartcampus.hub.util.BookingStatus;
import com.smartcampus.hub.util.NotificationType;
import com.smartcampus.hub.util.ResourceStatus;
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
    private final BookingMapper bookingMapper;
    private final NotificationService notificationService;

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> findAll() {
        return bookingRepository.findAll().stream().map(bookingMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> findAll(UUID actorUserId) {
        if (actorUserId == null) {
            return findAll();
        }

        User actor = getUser(actorUserId);
        boolean privileged = actor.getRole() == Role.ADMIN || actor.getRole() == Role.TECHNICIAN;
        List<Booking> bookings = privileged ? bookingRepository.findAll() : bookingRepository.findByRequesterId(actorUserId);
        return bookings.stream().map(bookingMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse findById(UUID id) {
        return bookingMapper.toResponse(getBooking(id));
    }

    @Override
    public BookingResponse createBooking(BookingRequest request) {
        Resource resource = getResource(request.resourceId());
        User requester = getUser(request.requesterId());

        validateResourceAvailability(resource);
        validateTimeRange(request.startTime(), request.endTime());
        validateConflicts(resource.getId(), request.startTime(), request.endTime(), null);

        Booking booking = new Booking();
        applyRequest(booking, request, resource, requester);
        booking.setStatus(BookingStatus.PENDING);
        booking.setRejectionReason(null);

        Booking saved = bookingRepository.save(booking);
        notifyAdminsBookingCreated();
        return bookingMapper.toResponse(saved);
    }

    @Override
    public BookingResponse updateBookingDetails(UUID id, BookingRequest request) {
        Booking booking = getBooking(id);
        ensurePendingStatus(booking, "Only PENDING bookings can be updated");
        if (!booking.getRequester().getId().equals(request.requesterId())) {
            throw new AccessDeniedException("Only the requester can update booking details");
        }

        Resource resource = getResource(request.resourceId());
        User requester = getUser(request.requesterId());

        validateResourceAvailability(resource);
        validateTimeRange(request.startTime(), request.endTime());
        validateConflicts(resource.getId(), request.startTime(), request.endTime(), id);

        applyRequest(booking, request, resource, requester);
        return bookingMapper.toResponse(bookingRepository.save(booking));
    }

    @Override
    public BookingResponse approveBooking(UUID id, UUID actorUserId) {
        Booking booking = getBooking(id);
        ensurePendingStatus(booking, "Only PENDING bookings can be approved");
        validateReviewerRole(actorUserId);

        validateConflicts(booking.getResource().getId(), booking.getStartTime(), booking.getEndTime(), booking.getId());
        booking.setStatus(BookingStatus.APPROVED);
        booking.setRejectionReason(null);
        Booking saved = bookingRepository.save(booking);
        notifyRequester(saved, NotificationType.BOOKING_APPROVED, "Your booking was approved");
        return bookingMapper.toResponse(saved);
    }

    @Override
    public BookingResponse rejectBooking(UUID id, UUID actorUserId, String reason) {
        Booking booking = getBooking(id);
        ensurePendingStatus(booking, "Only PENDING bookings can be rejected");
        validateReviewerRole(actorUserId);
        if (reason == null || reason.isBlank()) {
            throw new BusinessException("Rejection reason is required");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(reason.trim());
        Booking saved = bookingRepository.save(booking);
        notifyRequester(saved, NotificationType.BOOKING_REJECTED, "Your booking was rejected");
        return bookingMapper.toResponse(saved);
    }

    @Override
    public BookingResponse cancelBooking(UUID id, UUID actorUserId) {
        Booking booking = getBooking(id);
        if (booking.getStatus() != BookingStatus.PENDING && booking.getStatus() != BookingStatus.APPROVED) {
            throw new BusinessException("Only PENDING or APPROVED bookings can be cancelled");
        }
        if (!OffsetDateTime.now().isBefore(booking.getEndTime())) {
            throw new BusinessException("Booking cannot be cancelled after it ends");
        }

        User actor = getUser(actorUserId);
        boolean isRequester = booking.getRequester().getId().equals(actorUserId);
        boolean isPrivileged = actor.getRole() == Role.ADMIN || actor.getRole() == Role.TECHNICIAN;
        if (!isRequester && !isPrivileged) {
            throw new AccessDeniedException("Only requester, ADMIN, or TECHNICIAN can cancel this booking");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setRejectionReason(null);
        return bookingMapper.toResponse(bookingRepository.save(booking));
    }

    @Override
    public BookingResponse checkIn(UUID id) {
        Booking booking = getBooking(id);
        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new BusinessException("Only APPROVED bookings can be checked in");
        }
        if (booking.isCheckedIn()) {
            return bookingMapper.toResponse(booking);
        }
        booking.setCheckedIn(true);
        booking.setCheckedInAt(OffsetDateTime.now());
        return bookingMapper.toResponse(bookingRepository.save(booking));
    }

    @Override
    public void delete(UUID id) {
        bookingRepository.delete(getBooking(id));
    }

    private void applyRequest(Booking booking, BookingRequest request, Resource resource, User requester) {
        booking.setTitle(request.title());
        booking.setResource(resource);
        booking.setRequester(requester);
        booking.setStartTime(request.startTime());
        booking.setEndTime(request.endTime());
        booking.setAttendeeCount(request.attendeeCount());
        booking.setPurpose(request.purpose());
    }

    private void validateResourceAvailability(Resource resource) {
        if (resource.getStatus() == ResourceStatus.OUT_OF_SERVICE) {
            throw new BusinessException("OUT_OF_SERVICE resources cannot be booked");
        }
    }

    private void validateTimeRange(OffsetDateTime startTime, OffsetDateTime endTime) {
        if (!startTime.isBefore(endTime)) {
            throw new BusinessException("Booking end time must be after start time");
        }
    }

    private void validateConflicts(Long resourceId, OffsetDateTime startTime, OffsetDateTime endTime, UUID excludeId) {
        boolean conflict = bookingRepository.existsConflict(resourceId, startTime, endTime, excludeId);
        if (conflict) {
            throw new BusinessException("Booking request conflicts with an existing reservation");
        }
    }

    private void validateReviewerRole(UUID actorUserId) {
        Role role = getUser(actorUserId).getRole();
        if (role != Role.ADMIN && role != Role.TECHNICIAN) {
            throw new AccessDeniedException("Only ADMIN or TECHNICIAN can approve/reject bookings");
        }
    }

    private void ensurePendingStatus(Booking booking, String message) {
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BusinessException(message);
        }
    }

    private void notifyAdminsBookingCreated() {
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        for (User admin : admins) {
            notificationService.createNotification(
                    admin.getId(), "Booking request submitted", NotificationType.BOOKING_CREATED);
        }
    }

    private void notifyRequester(Booking booking, NotificationType type, String message) {
        notificationService.createNotification(booking.getRequester().getId(), message, type);
    }

    private Resource getResource(Long id) {
        return resourceRepository.findById(id).orElseThrow(() -> new NotFoundException("Resource not found: " + id));
    }

    private User getUser(UUID id) {
        return userRepository.findById(id).orElseThrow(() -> new NotFoundException("User not found: " + id));
    }

    private Booking getBooking(UUID id) {
        return bookingRepository.findById(id).orElseThrow(() -> new NotFoundException("Booking not found: " + id));
    }
}
