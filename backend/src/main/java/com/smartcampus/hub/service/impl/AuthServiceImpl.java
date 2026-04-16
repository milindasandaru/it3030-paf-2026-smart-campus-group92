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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private static final String GOOGLE_LOGIN_URL = "/oauth2/authorization/google";
    private static final List<LoginSeed> DEMO_USERS = List.of(
            new LoginSeed("admin", "admin@smartcampus.edu", "Admin@123", "ADMIN"),
            new LoginSeed("lecturer", "lecturer@smartcampus.edu", "Lecturer@123", "LECTURER"),
            new LoginSeed("student", "student@smartcampus.edu", "Student@123", "STUDENT"));

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public AuthResponse getUser(UUID id) {
        User user = getEntity(id);
        return toResponse(user, "User profile loaded");
    }

    @Override
    public AuthResponse create(AuthRequest request) {
        User user = userRepository.findByEmail(request.email()).orElseGet(User::new);
        user.setEmail(request.email());
        user.setFullName(request.fullName());
        if (user.getRole() == null) {
            user.setRole(Role.STUDENT);
        }
        user.setProvider("google");
        return toResponse(userRepository.save(user), "OAuth2 placeholder user created or updated");
    }

    @Override
    public AuthResponse update(UUID id, AuthRequest request) {
        User user = getEntity(id);
        user.setEmail(request.email());
        user.setFullName(request.fullName());
        return toResponse(userRepository.save(user), "User profile updated");
    }

    @Override
    public void delete(UUID id) {
        userRepository.delete(getEntity(id));
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse getConfig() {
        return new AuthResponse(null, null, null, GOOGLE_LOGIN_URL, "Google OAuth2 placeholder is configured");
    }

    @Override
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        LoginSeed user = findDemoUser(request.identifier());
        if (user == null || !user.password().equals(request.password())) {
            throw new BusinessException("Invalid username/email or password");
        }

        String token = "demo-token-" + user.role().toLowerCase() + "-" + UUID.randomUUID();
        return new LoginResponse(user.username(), user.role(), token);
    }

    private User getEntity(UUID id) {
        return userRepository.findById(id).orElseThrow(() -> new NotFoundException("User not found: " + id));
    }

    private AuthResponse toResponse(User user, String message) {
        return new AuthResponse(user.getId(), user.getEmail(), user.getFullName(), GOOGLE_LOGIN_URL, message);
    }

    private LoginSeed findDemoUser(String identifier) {
        String normalized = identifier == null ? "" : identifier.trim();
        return DEMO_USERS.stream()
                .filter(user -> user.username().equalsIgnoreCase(normalized)
                        || user.email().equalsIgnoreCase(normalized))
                .findFirst()
                .orElse(null);
    }

    private record LoginSeed(String username, String email, String password, String role) {}
}
