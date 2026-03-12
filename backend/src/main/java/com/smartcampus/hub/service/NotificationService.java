package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.NotificationRequest;
import com.smartcampus.hub.dto.NotificationResponse;
import java.util.List;
import java.util.UUID;

public interface NotificationService {

    List<NotificationResponse> findAll();

    NotificationResponse findById(UUID id);

    NotificationResponse create(NotificationRequest request);

    NotificationResponse update(UUID id, NotificationRequest request);

    void delete(UUID id);

    List<NotificationResponse> findByRecipient(UUID recipientId);
}
