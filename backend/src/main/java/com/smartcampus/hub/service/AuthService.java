package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.AuthRequest;
import com.smartcampus.hub.dto.AuthResponse;
import com.smartcampus.hub.dto.LoginRequest;
import com.smartcampus.hub.dto.LoginResponse;
import java.util.List;
import java.util.UUID;

public interface AuthService {

    List<AuthResponse> listUsers();

    AuthResponse getUser(UUID id);

    AuthResponse create(AuthRequest request);

    AuthResponse update(UUID id, AuthRequest request);

    void delete(UUID id);

    AuthResponse getConfig();

    LoginResponse login(LoginRequest request);
}
