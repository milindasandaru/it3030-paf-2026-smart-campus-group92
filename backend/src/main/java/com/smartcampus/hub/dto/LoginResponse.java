package com.smartcampus.hub.dto;

import java.util.UUID;

public record LoginResponse(UUID userId, String username, String email, String role, String token) {}