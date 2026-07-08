package com.smartcampus.hub.dto;

import com.smartcampus.hub.util.Role;
import java.util.UUID;

public record AuthResponse(
        UUID userId,
        String email,
        String fullName,
        Role role,
        String provider,
        boolean notificationEnabled,
        String loginUrl,
        String message) {}
