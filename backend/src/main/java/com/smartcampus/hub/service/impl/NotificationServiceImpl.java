package com.smartcampus.hub.service.impl;

import com.smartcampus.hub.dto.NotificationRequest;
import com.smartcampus.hub.dto.NotificationResponse;
import com.smartcampus.hub.entity.Notification;
import com.smartcampus.hub.entity.User;
import com.smartcampus.hub.exception.NotFoundException;
import com.smartcampus.hub.mapper.NotificationMapper;
import com.smartcampus.hub.repository.NotificationRepository;
import com.smartcampus.hub.repository.UserRepository;
import com.smartcampus.hub.service.NotificationService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationMapper notificationMapper;

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> findAll() {
        return notificationRepository.findAll().stream().map(notificationMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationResponse findById(UUID id) {
        return notificationMapper.toResponse(getNotification(id));
    }

    @Override
    public NotificationResponse create(NotificationRequest request) {
        Notification notification = new Notification();
        applyRequest(notification, request);
        return notificationMapper.toResponse(notificationRepository.save(notification));
    }

    @Override
    public NotificationResponse update(UUID id, NotificationRequest request) {
        Notification notification = getNotification(id);
        applyRequest(notification, request);
        return notificationMapper.toResponse(notificationRepository.save(notification));
    }

    @Override
    public void delete(UUID id) {
        notificationRepository.delete(getNotification(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> findByRecipient(UUID recipientId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(recipientId).stream()
                .map(notificationMapper::toResponse)
                .toList();
    }

    private void applyRequest(Notification notification, NotificationRequest request) {
        User recipient = userRepository
                .findById(request.recipientId())
                .orElseThrow(() -> new NotFoundException("User not found: " + request.recipientId()));

        notification.setTitle(request.title());
        notification.setMessage(request.message());
        notification.setNotificationType(request.notificationType());
        notification.setReadFlag(request.readFlag());
        notification.setRecipient(recipient);
    }

    private Notification getNotification(UUID id) {
        return notificationRepository
                .findById(id)
                .orElseThrow(() -> new NotFoundException("Notification not found: " + id));
    }
}
