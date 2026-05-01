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
import com.smartcampus.hub.util.ResourceStatus;
import com.smartcampus.hub.util.ResourceType;
import com.smartcampus.hub.util.Role;
import java.time.Duration;
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

        private static final List<BookingStatus> BLOCKING_BOOKING_STATUSES = List.of(BookingStatus.APPROVED);
        private static final List<BookingStatus> DUPLICATE_CHECK_STATUSES =
            List.of(BookingStatus.PENDING, BookingStatus.APPROVED);

        private static final int MIN_STUDENT_GROUP_SIZE = 5;
        private static final int DEFAULT_SLOT_INTERVAL_MINUTES = 15;
        private static final int DEFAULT_MIN_DURATION_MINUTES = 15;
        private static final int DEFAULT_MAX_DURATION_MINUTES = 480;
        private static final int DEFAULT_MIN_ADVANCE_MINUTES = 30;

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
        Resource resource = getResource(request.resourceId());
        User requester = getUser(request.userId());

        validateNoGenericStatusUpdate(request);
        validateResourceAvailability(resource);
        validateRoleAccess(resource.getType(), requester.getRole(), request.attendeeCount(), request.purpose());
        validateTimeRange(request.startTime(), request.endTime());
        validateFutureTime(request.startTime());
        validateResourceTimeConstraints(resource, request.startTime(), request.endTime());
        validateConflicts(resource, request.startTime(), request.endTime(), null);
        validateNoDuplicateExactBooking(request, null);

        Booking booking = new Booking();
        applyRequest(booking, request, resource, requester, BookingStatus.PENDING);
        booking.setStatus(BookingStatus.PENDING);

        Booking saved = bookingRepository.save(booking);
        notifyAdminsBookingCreated();
        return bookingMapper.toResponse(saved);
    }

    @Override
    public BookingResponse updateBookingDetails(UUID id, BookingRequest request) {
        Booking booking = getBooking(id);
        ensurePendingStatus(booking, "Only PENDING bookings can be updated");
        if (!booking.getRequester().getId().equals(request.userId())) {
            throw new AccessDeniedException("Only the requester can update booking details");
        }

        Resource resource = getResource(request.resourceId());
        User requester = getUser(request.userId());

        validateNoGenericStatusUpdate(request);
        validateResourceAvailability(resource);
        validateRoleAccess(resource.getType(), requester.getRole(), request.attendeeCount(), request.purpose());
        validateTimeRange(request.startTime(), request.endTime());
        validateFutureTime(request.startTime());
        validateResourceTimeConstraints(resource, request.startTime(), request.endTime());
        validateConflicts(resource, request.startTime(), request.endTime(), id);
        validateNoDuplicateExactBooking(request, id);

        applyRequest(booking, request, resource, requester, BookingStatus.PENDING);
        return bookingMapper.toResponse(bookingRepository.save(booking));
    }

    @Override
    public BookingResponse approveBooking(UUID id, UUID actorUserId) {
        Booking booking = getBooking(id);
        ensurePendingStatus(booking, "Only PENDING bookings can be approved");
        validateReviewerRole(actorUserId);

        validateConflicts(booking.getResource(), booking.getStartTime(), booking.getEndTime(), booking.getId());
        booking.setStatus(BookingStatus.APPROVED);
        Booking saved = bookingRepository.save(booking);
        notifyRequester(saved, NotificationType.BOOKING_APPROVED, "Your booking was approved");
        return bookingMapper.toResponse(saved);
    }

    @Override
    public BookingResponse rejectBooking(UUID id, UUID actorUserId) {
        Booking booking = getBooking(id);
        ensurePendingStatus(booking, "Only PENDING bookings can be rejected");
        validateReviewerRole(actorUserId);

        booking.setStatus(BookingStatus.REJECTED);
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

    private void applyRequest(
            Booking booking,
            BookingRequest request,
            Resource resource,
            User requester,
            BookingStatus defaultStatus) {
        booking.setTitle("Booking request submitted");
        booking.setResource(resource);
        booking.setRequester(requester);
        booking.setStartTime(request.startTime());
        booking.setEndTime(request.endTime());
        booking.setAttendeeCount(request.attendeeCount());
        booking.setPurpose(request.purpose());
        if (booking.getStatus() == null) {
            booking.setStatus(defaultStatus);
        }
    }

    private void validateRoleAccess(ResourceType type, Role role, Integer attendeeCount, String purpose) {
        if (role == Role.ADMIN || role == Role.TECHNICIAN || role == Role.STAFF) {
            throw new AccessDeniedException("This role is not allowed to create bookings");
        }

        if (role == Role.LECTURER) {
            return;
        }

        if (role != Role.STUDENT) {
            throw new AccessDeniedException("User role is not allowed to create bookings");
        }

        if (type == ResourceType.STUDY_AREA
            || type == ResourceType.STUDY_ROOM
            || type == ResourceType.BOOK
            || type == ResourceType.DOCUMENT) {
            return;
        }

        validateStudentSpecialCase(attendeeCount, purpose);
    }

    private void validateStudentSpecialCase(Integer attendeeCount, String purpose) {
        if (attendeeCount == null || attendeeCount < MIN_STUDENT_GROUP_SIZE) {
            throw new AccessDeniedException(
                    "Student requests for this resource require attendeeCount >= " + MIN_STUDENT_GROUP_SIZE);
        }
        if (purpose == null || purpose.isBlank()) {
            throw new AccessDeniedException("Student requests for this resource require a purpose/reason");
        }
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

    private void validateFutureTime(OffsetDateTime startTime) {
        if (!startTime.isAfter(OffsetDateTime.now())) {
            throw new BusinessException("Booking start time must be strictly in the future");
        }
    }

    private void validateResourceTimeConstraints(Resource resource, OffsetDateTime startTime, OffsetDateTime endTime) {
        int slotInterval = valueOrDefault(resource.getBookingSlotIntervalMinutes(), DEFAULT_SLOT_INTERVAL_MINUTES);
        int minDuration = valueOrDefault(resource.getMinBookingDurationMinutes(), DEFAULT_MIN_DURATION_MINUTES);
        int maxDuration = valueOrDefault(resource.getMaxBookingDurationMinutes(), DEFAULT_MAX_DURATION_MINUTES);
        int minAdvance = valueOrDefault(resource.getMinAdvanceBookingMinutes(), DEFAULT_MIN_ADVANCE_MINUTES);

        if (slotInterval <= 0 || minDuration <= 0 || maxDuration < minDuration || minAdvance < 0) {
            throw new BusinessException("Resource booking constraints are invalid");
        }

        validateSlotAlignment(startTime, endTime, slotInterval);

        long durationMinutes = Duration.between(startTime, endTime).toMinutes();
        if (durationMinutes < minDuration || durationMinutes > maxDuration) {
            throw new BusinessException("Booking duration is outside configured resource limits");
        }
        if (durationMinutes % slotInterval != 0) {
            throw new BusinessException("Booking duration must align with slot interval");
        }

        OffsetDateTime minAllowedStart = OffsetDateTime.now().plusMinutes(minAdvance);
        if (startTime.isBefore(minAllowedStart)) {
            throw new BusinessException("Booking does not satisfy minimum advance booking requirement");
        }
    }

    private void validateSlotAlignment(OffsetDateTime startTime, OffsetDateTime endTime, int slotIntervalMinutes) {
        if ((startTime.getMinute() % slotIntervalMinutes) != 0
                || startTime.getSecond() != 0
                || startTime.getNano() != 0) {
            throw new BusinessException("Booking start time must align with configured slot interval");
        }
        if ((endTime.getMinute() % slotIntervalMinutes) != 0 || endTime.getSecond() != 0 || endTime.getNano() != 0) {
            throw new BusinessException("Booking end time must align with configured slot interval");
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
                    resource.getId(), startTime, endTime, BLOCKING_BOOKING_STATUSES, excludeId);
            if (activeBookings >= totalUnits) {
                throw new ConflictException("Book resource has no available copies for the selected time range");
            }
            return;
        }

        boolean conflict = bookingRepository.existsOverlapping(
                resource.getId(), startTime, endTime, BLOCKING_BOOKING_STATUSES, excludeId);
        if (conflict) {
            throw new ConflictException("Booking request conflicts with an existing reservation");
        }
    }

    private void validateNoDuplicateExactBooking(BookingRequest request, UUID excludeId) {
        boolean duplicate = bookingRepository.existsExactBooking(
                request.userId(),
                request.resourceId(),
                request.startTime(),
                request.endTime(),
                DUPLICATE_CHECK_STATUSES,
                excludeId);
        if (duplicate) {
            throw new ConflictException("Duplicate booking request exists for the same user/resource/time window");
        }
    }

    private void validateNoGenericStatusUpdate(BookingRequest request) {
        if (request.status() != null) {
            throw new BusinessException("Status updates are not allowed in create/update details endpoint");
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

    private int valueOrDefault(Integer value, int defaultValue) {
        return value == null ? defaultValue : value;
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
