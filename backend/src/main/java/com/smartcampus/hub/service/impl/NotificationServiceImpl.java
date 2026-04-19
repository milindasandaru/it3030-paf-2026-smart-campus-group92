package com.smartcampus.hub.service.impl;

import com.smartcampus.hub.dto.NotificationResponse;
import com.smartcampus.hub.entity.Notification;
import com.smartcampus.hub.entity.User;
import com.smartcampus.hub.exception.AccessDeniedException;
import com.smartcampus.hub.exception.NotFoundException;
import com.smartcampus.hub.mapper.NotificationMapper;
import com.smartcampus.hub.repository.NotificationRepository;
import com.smartcampus.hub.repository.UserRepository;
import com.smartcampus.hub.service.NotificationService;
import com.smartcampus.hub.util.NotificationType;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationMapper notificationMapper;

    @Override
    public NotificationResponse createNotification(UUID userId, String message, NotificationType type) {
        User recipient = userRepository
                .findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found: " + userId));

        Notification notification = new Notification();
        notification.setMessage(message);
        notification.setNotificationType(type);
        notification.setReadFlag(false);
        notification.setRecipient(recipient);
        return notificationMapper.toResponse(notificationRepository.save(notification));
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications() {
        UUID currentUserId = getCurrentUser().getId();
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(currentUserId).stream()
                .map(notificationMapper::toResponse)
                .toList();
    }

    @Override
    public NotificationResponse markAsRead(UUID id) {
        User currentUser = getCurrentUser();
        Notification notification = getNotification(id);
        if (!notification.getRecipient().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Users can only access their own notifications");
        }

        notification.setReadFlag(true);
        return notificationMapper.toResponse(notificationRepository.save(notification));
    }

    private Notification getNotification(UUID id) {
        return notificationRepository
                .findById(id)
                .orElseThrow(() -> new NotFoundException("Notification not found: " + id));
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            throw new AccessDeniedException("Authentication is required");
        }

        String email = authentication.getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new NotFoundException("User not found: " + email));
    }
}
