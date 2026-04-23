package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.AuthRequest;
import com.smartcampus.hub.dto.AuthResponse;
import com.smartcampus.hub.dto.LoginRequest;
import com.smartcampus.hub.dto.LoginResponse;
import com.smartcampus.hub.service.AuthService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @GetMapping("/users")
    public List<AuthResponse> listUsers() {
        return authService.listUsers();
    }

    @GetMapping("/config")
    public AuthResponse getConfig() {
        return authService.getConfig();
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/{id}")
    public AuthResponse getById(@PathVariable UUID id) {
        return authService.getUser(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse create(@Valid @RequestBody AuthRequest request) {
        return authService.create(request);
    }

    @PutMapping("/{id}")
    public AuthResponse update(@PathVariable UUID id, @Valid @RequestBody AuthRequest request) {
        return authService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        authService.delete(id);
    }
}
