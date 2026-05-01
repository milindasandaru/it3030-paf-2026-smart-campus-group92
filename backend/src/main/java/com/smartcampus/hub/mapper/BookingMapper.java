package com.smartcampus.hub.mapper;

import com.smartcampus.hub.dto.BookingResponse;
import com.smartcampus.hub.entity.Booking;
import org.springframework.stereotype.Component;

@Component
public class BookingMapper {

    public BookingResponse toResponse(Booking booking) {
        return new BookingResponse(
                booking.getId(),
                booking.getResource().getId(),
                booking.getRequester().getId(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getAttendeeCount(),
                booking.getPurpose(),
                booking.getStatus(),
                booking.isCheckedIn(),
                booking.getCheckedInAt(),
                "booking:" + booking.getId());
    }
}
