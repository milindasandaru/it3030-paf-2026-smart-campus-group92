package com.smartcampus.hub.dto;

import java.util.UUID;

public record AuthResponse(UUID userId, String email, String fullName, String loginUrl, String message) {}
