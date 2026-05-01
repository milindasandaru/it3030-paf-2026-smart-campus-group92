package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.BookingRequest;
import com.smartcampus.hub.dto.BookingResponse;
import java.util.List;
import java.util.UUID;

public interface BookingService {

    List<BookingResponse> findAll();

    BookingResponse findById(UUID id);

    BookingResponse createBooking(BookingRequest request);

    BookingResponse updateBookingDetails(UUID id, BookingRequest request);

    BookingResponse approveBooking(UUID id, UUID actorUserId);

    BookingResponse rejectBooking(UUID id, UUID actorUserId);

    BookingResponse cancelBooking(UUID id, UUID actorUserId);

    BookingResponse checkIn(UUID id);

    void delete(UUID id);
}
