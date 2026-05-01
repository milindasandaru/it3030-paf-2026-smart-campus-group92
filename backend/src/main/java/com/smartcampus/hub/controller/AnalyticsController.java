package com.smartcampus.hub.controller;

import com.smartcampus.hub.repository.BookingRepository;
import com.smartcampus.hub.repository.TicketRepository;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;

    // @GetMapping("/top-resources")
    // public List<Map<String, ?>> topResources() {
    //     return bookingRepository.findTopResources().stream()
    //             .map(item -> Map.of("resourceName", item.getResourceName(), "bookingCount", item.getBookingCount()))
    //             .toList();
    // }

    // @GetMapping("/peak-hours")
    // public List<Map<String, ?>> peakHours() {
    //     return bookingRepository.findPeakHours().stream()
    //             .map(item -> Map.of("hourOfDay", item.getHourOfDay(), "bookingCount", item.getBookingCount()))
    //             .toList();
    // }

    // @GetMapping("/booking-trends")
    // public List<Map<String, ?>> bookingTrends() {
    //     return bookingRepository.findBookingTrends().stream()
    //             .map(item -> Map.of("bookingDate", item.getBookingDate(), "bookingCount", item.getBookingCount()))
    //             .toList();
    // }

    // @GetMapping("/ticket-status")
    // public List<Map<String, ?>> ticketStatus() {
    //     return ticketRepository.countByStatus().stream()
    //             .map(item -> Map.of("status", item.getStatus(), "ticketCount", item.getTicketCount()))
    //             .toList();
    // }

    @GetMapping("/top-resources")
    public List<Map<String, Object>> topResources() {
    return bookingRepository.findTopResources().stream()
            .map(item -> Map.<String, Object>of(
                    "resourceName", item.getResourceName(),
                    "bookingCount", item.getBookingCount()
            ))
            .toList();
    }

    @GetMapping("/peak-hours")
    public List<Map<String, Object>> peakHours() {
    return bookingRepository.findPeakHours().stream()
            .map(item -> Map.<String, Object>of(
                    "hourOfDay", item.getHourOfDay(),
                    "bookingCount", item.getBookingCount()
            ))
            .toList();
    }

    @GetMapping("/booking-trends")
    public List<Map<String, Object>> bookingTrends() {
    return bookingRepository.findBookingTrends().stream()
            .map(item -> Map.<String, Object>of(
                    "bookingDate", item.getBookingDate(),
                    "bookingCount", item.getBookingCount()
            ))
            .toList();
    }
    @GetMapping("/ticket-status")
    public List<Map<String, Object>> ticketStatus() {
    return ticketRepository.countByStatus().stream()
            .map(item -> Map.<String, Object>of(
                    "status", item.getStatus(),
                    "ticketCount", item.getTicketCount()
            ))
            .toList();
    }

}
