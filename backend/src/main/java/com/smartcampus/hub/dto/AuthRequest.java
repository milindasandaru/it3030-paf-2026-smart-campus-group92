package com.smartcampus.hub.dto;

import com.smartcampus.hub.util.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AuthRequest(
        @Email @NotBlank String email,
        @NotBlank String fullName,
        String password,
        Role role,
        Boolean notificationEnabled) {}
