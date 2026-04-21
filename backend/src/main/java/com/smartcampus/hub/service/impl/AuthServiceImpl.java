package com.smartcampus.hub.service.impl;

import com.smartcampus.hub.dto.AuthRequest;
import com.smartcampus.hub.dto.AuthResponse;
import com.smartcampus.hub.dto.LoginRequest;
import com.smartcampus.hub.dto.LoginResponse;
import com.smartcampus.hub.entity.User;
import com.smartcampus.hub.exception.BusinessException;
import com.smartcampus.hub.exception.NotFoundException;
import com.smartcampus.hub.repository.UserRepository;
import com.smartcampus.hub.service.AuthService;
import com.smartcampus.hub.util.Role;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private static final String GOOGLE_LOGIN_URL = "/oauth2/authorization/google";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public List<AuthResponse> listUsers() {
        return userRepository.findAll().stream().map(user -> toResponse(user, "User loaded")).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse getUser(UUID id) {
        User user = getEntity(id);
        return toResponse(user, "User profile loaded");
    }

    @Override
    public AuthResponse create(AuthRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.email()).orElseGet(User::new);
        user.setEmail(request.email());
        user.setFullName(request.fullName());
        user.setRole(request.role() == null ? Role.STUDENT : request.role());
        user.setProvider("google");
        return toResponse(userRepository.save(user), "OAuth2 placeholder user created or updated");
    }

    @Override
    public AuthResponse update(UUID id, AuthRequest request) {
        User user = getEntity(id);
        user.setEmail(request.email());
        user.setFullName(request.fullName());
        if (request.role() != null) {
            user.setRole(request.role());
        }
        return toResponse(userRepository.save(user), "User profile updated");
    }

    @Override
    public void delete(UUID id) {
        userRepository.delete(getEntity(id));
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse getConfig() {
        return new AuthResponse(
            null,
            null,
            null,
            null,
            GOOGLE_LOGIN_URL,
            "Google OAuth2 placeholder is configured");
    }

    @Override
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        String email = resolveLoginEmail(request.identifier());
        User user = userRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() -> new BusinessException("Invalid username/email or password"));

        if (user.getPassword() == null || !passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BusinessException("Invalid username/email or password");
        }

        String token = "demo-token-" + user.getRole().name().toLowerCase() + "-" + UUID.randomUUID();
        return new LoginResponse(
                user.getId(),
                toUsername(user.getEmail()),
                user.getEmail(),
                user.getRole().name(),
                token);
    }

    private User getEntity(UUID id) {
        return userRepository.findById(id).orElseThrow(() -> new NotFoundException("User not found: " + id));
    }

    private AuthResponse toResponse(User user, String message) {
        return new AuthResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                GOOGLE_LOGIN_URL,
                message);
    }

    private String resolveLoginEmail(String identifier) {
        String normalized = identifier == null ? "" : identifier.trim();
        if (normalized.isBlank()) {
            throw new BusinessException("Identifier is required");
        }

        if (normalized.contains("@")) {
            return normalized;
        }

        return normalized + "@smartcampus.edu";
    }

    private String toUsername(String email) {
        int at = email.indexOf('@');
        return at > 0 ? email.substring(0, at) : email;
    }
}
