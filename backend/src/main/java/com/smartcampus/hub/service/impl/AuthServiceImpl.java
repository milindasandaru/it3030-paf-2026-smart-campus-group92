package com.smartcampus.hub.service.impl;

import com.smartcampus.hub.dto.AuthRequest;
import com.smartcampus.hub.dto.AuthResponse;
import com.smartcampus.hub.entity.User;
import com.smartcampus.hub.exception.NotFoundException;
import com.smartcampus.hub.repository.UserRepository;
import com.smartcampus.hub.service.AuthService;
import com.smartcampus.hub.util.Role;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private static final String GOOGLE_LOGIN_URL = "/oauth2/authorization/google";

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

    private User getEntity(UUID id) {
        return userRepository.findById(id).orElseThrow(() -> new NotFoundException("User not found: " + id));
    }

    private AuthResponse toResponse(User user, String message) {
        return new AuthResponse(user.getId(), user.getEmail(), user.getFullName(), GOOGLE_LOGIN_URL, message);
    }
}
