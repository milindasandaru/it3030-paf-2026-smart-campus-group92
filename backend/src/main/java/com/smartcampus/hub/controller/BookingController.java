package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.BookingRequest;
import com.smartcampus.hub.dto.BookingResponse;
import com.smartcampus.hub.service.BookingService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @GetMapping
    public List<BookingResponse> getAll() {
        return bookingService.findAll();
    }

    @GetMapping("/{id}")
    public BookingResponse getById(@PathVariable UUID id) {
        return bookingService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponse create(@Valid @RequestBody BookingRequest request) {
        return bookingService.createBooking(request);
    }

    @PutMapping("/{id}")
    public BookingResponse updateDetails(@PathVariable UUID id, @Valid @RequestBody BookingRequest request) {
        return bookingService.updateBookingDetails(id, request);
    }

    @PutMapping("/{id}/approve")
    public BookingResponse approve(@PathVariable UUID id, @RequestParam UUID actorUserId) {
        return bookingService.approveBooking(id, actorUserId);
    }

    @PutMapping("/{id}/reject")
    public BookingResponse reject(@PathVariable UUID id, @RequestParam UUID actorUserId) {
        return bookingService.rejectBooking(id, actorUserId);
    }

    @PutMapping("/{id}/cancel")
    public BookingResponse cancel(@PathVariable UUID id, @RequestParam UUID actorUserId) {
        return bookingService.cancelBooking(id, actorUserId);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        bookingService.delete(id);
    }
}
