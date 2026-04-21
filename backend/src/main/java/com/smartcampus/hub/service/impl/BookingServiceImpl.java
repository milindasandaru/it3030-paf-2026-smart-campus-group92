package com.smartcampus.hub.service.impl;

import com.smartcampus.hub.dto.BookingRequest;
import com.smartcampus.hub.dto.BookingResponse;
import com.smartcampus.hub.entity.Booking;
import com.smartcampus.hub.entity.Resource;
import com.smartcampus.hub.entity.User;
import com.smartcampus.hub.exception.BusinessException;
import com.smartcampus.hub.exception.NotFoundException;
import com.smartcampus.hub.mapper.BookingMapper;
import com.smartcampus.hub.repository.BookingRepository;
import com.smartcampus.hub.repository.ResourceRepository;
import com.smartcampus.hub.repository.UserRepository;
import com.smartcampus.hub.service.BookingService;
import com.smartcampus.hub.util.BookingStatus;
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
        validateSchedule(request, null);

        Booking booking = new Booking();
        applyRequest(booking, request);
        return bookingMapper.toResponse(bookingRepository.save(booking));
    }

    @Override
    public BookingResponse update(UUID id, BookingRequest request) {
        validateSchedule(request, id);

        Booking booking = getBooking(id);
        applyRequest(booking, request);
        return bookingMapper.toResponse(bookingRepository.save(booking));
    }

    @Override
    public void delete(UUID id) {
        bookingRepository.delete(getBooking(id));
    }

    private void applyRequest(Booking booking, BookingRequest request) {
        Resource resource = getResource(request.resourceId());
        User requester = getUser(request.requesterId());

        booking.setTitle(request.title());
        booking.setResource(resource);
        booking.setRequester(requester);
        booking.setStartTime(request.startTime());
        booking.setEndTime(request.endTime());
        booking.setStatus(request.status() == null ? BookingStatus.PENDING : request.status());
    }

    private void validateSchedule(BookingRequest request, UUID excludeId) {
        if (!request.startTime().isBefore(request.endTime())) {
            throw new BusinessException("Booking end time must be after start time");
        }

        boolean conflict = bookingRepository.existsConflict(
                request.resourceId(), request.startTime(), request.endTime(), excludeId);
        if (conflict) {
            throw new BusinessException("Booking request conflicts with an existing reservation");
        }
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
