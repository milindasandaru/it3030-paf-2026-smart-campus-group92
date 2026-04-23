package com.smartcampus.hub.mapper;

import com.smartcampus.hub.dto.BookingResponse;
import com.smartcampus.hub.entity.Booking;
import org.springframework.stereotype.Component;

@Component
public class BookingMapper {

    public BookingResponse toResponse(Booking booking) {
        return new BookingResponse(
                booking.getId(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getAttendeeCount(),
                booking.getPurpose(),
                booking.getStatus(),
                booking.getResource().getId(),
                booking.getResource().getName(),
                booking.getRequester().getId(),
                booking.getRequester().getFullName(),
                booking.getCreatedAt(),
                booking.getUpdatedAt());
    }
}
