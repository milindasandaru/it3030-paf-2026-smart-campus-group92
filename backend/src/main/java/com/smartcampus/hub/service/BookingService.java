package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.BookingRequest;
import com.smartcampus.hub.dto.BookingResponse;
import java.util.List;
import java.util.UUID;

public interface BookingService {

    List<BookingResponse> findAll();

    BookingResponse findById(UUID id);

    BookingResponse createBooking(BookingRequest request);

    BookingResponse create(BookingRequest request);

    BookingResponse update(UUID id, BookingRequest request);

    void delete(UUID id);
}
