package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.NotificationRequest;
import com.smartcampus.hub.dto.NotificationResponse;
import com.smartcampus.hub.service.NotificationService;
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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public List<NotificationResponse> getAll(@RequestParam(required = false) UUID recipientId) {
        return recipientId == null ? notificationService.findAll() : notificationService.findByRecipient(recipientId);
    }

    @GetMapping("/{id}")
    public NotificationResponse getById(@PathVariable UUID id) {
        return notificationService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NotificationResponse create(@Valid @RequestBody NotificationRequest request) {
        return notificationService.create(request);
    }

    @PutMapping("/{id}")
    public NotificationResponse update(@PathVariable UUID id, @Valid @RequestBody NotificationRequest request) {
        return notificationService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        notificationService.delete(id);
    }
}
