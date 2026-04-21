package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.NotificationCreateRequest;
import com.smartcampus.hub.dto.NotificationResponse;
import com.smartcampus.hub.service.NotificationService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import lombok.RequiredArgsConstructor;
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
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NotificationResponse create(@Valid @RequestBody NotificationCreateRequest request) {
        return notificationService.createNotification(request.userId(), request.message(), request.type());
    }

    @GetMapping
    public List<NotificationResponse> getAll(@RequestParam(required = false) UUID userId) {
        if (userId != null) {
            return notificationService.getUserNotifications(userId);
        }
        return notificationService.getMyNotifications();
    }

    @PutMapping("/{id}/read")
    public NotificationResponse markAsRead(@PathVariable UUID id, @RequestParam(required = false) UUID userId) {
        if (userId != null) {
            return notificationService.markAsRead(id, userId);
        }
        return notificationService.markAsRead(id);
    }
}
