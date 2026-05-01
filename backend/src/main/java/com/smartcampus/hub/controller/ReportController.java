package com.smartcampus.hub.controller;

import com.smartcampus.hub.entity.Booking;
import com.smartcampus.hub.repository.BookingRepository;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final BookingRepository bookingRepository;

    @GetMapping("/bookings")
    public ResponseEntity<?> bookingsReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime to,
            @RequestParam(required = false) UUID resourceId,
            @RequestParam(defaultValue = "json") String format) {
        OffsetDateTime fromValue = from == null ? OffsetDateTime.of(2000, 1, 1, 0, 0, 0, 0, ZoneOffset.UTC) : from;
        OffsetDateTime toValue = to == null ? OffsetDateTime.now().plusYears(10) : to;
        List<Booking> bookings = resourceId == null
                ? bookingRepository.findForReport(fromValue, toValue)
                : bookingRepository.findForReportByResource(fromValue, toValue, resourceId);
        if ("csv".equalsIgnoreCase(format)) {
            StringBuilder csv = new StringBuilder();
            csv.append("bookingId,resourceName,requesterId,startTime,endTime,status,checkedIn\n");
            for (Booking booking : bookings) {
                csv.append("%s,%s,%s,%s,%s,%s,%s\n"
                        .formatted(
                                booking.getId(),
                                escapeCsv(booking.getResource().getName()),
                                booking.getRequester().getId(),
                                booking.getStartTime(),
                                booking.getEndTime(),
                                booking.getStatus(),
                                booking.isCheckedIn()));
            }
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=bookings-report.csv")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(csv.toString());
        }

        Map<String, Long> topResources = bookings.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        b -> b.getResource().getName(), java.util.stream.Collectors.counting()));
        Map<Integer, Long> peakHours = bookings.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        b -> b.getStartTime().getHour(), java.util.stream.Collectors.counting()));

        Map<String, Object> payload = Map.of(
                "totalBookings",
                bookings.size(),
                "topResources",
                topResources,
                "peakHours",
                peakHours,
                "bookings",
                bookings.stream()
                        .map(booking -> Map.of(
                                "id",
                                booking.getId(),
                                "resourceName",
                                booking.getResource().getName(),
                                "status",
                                booking.getStatus(),
                                "startTime",
                                booking.getStartTime(),
                                "endTime",
                                booking.getEndTime(),
                                "checkedIn",
                                booking.isCheckedIn()))
                        .toList(),
                "format",
                MediaType.APPLICATION_JSON_VALUE);
        return ResponseEntity.ok(payload);
    }

    private String escapeCsv(String value) {
        return "\"" + value.replace("\"", "\"\"") + "\"";
    }
}
