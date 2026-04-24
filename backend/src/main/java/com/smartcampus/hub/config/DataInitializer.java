package com.smartcampus.hub.config;

import com.smartcampus.hub.entity.User;
import com.smartcampus.hub.repository.UserRepository;
import com.smartcampus.hub.util.Role;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Initializes default test users on application startup.
 * This is useful for local development and initial deployments.
 */
@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public ApplicationRunner initializeUsers() {
        return args -> {
            // Create admin user
            createUserIfNotExists(
                    "admin@smartcampus.edu",
                    "Admin User",
                    "admin123",
                    Role.ADMIN
            );

            // Create staff user
            createUserIfNotExists(
                    "staff@smartcampus.edu",
                    "Staff User",
                    "staff123",
                    Role.STAFF
            );

            // Create student user
            createUserIfNotExists(
                    "student@smartcampus.edu",
                    "Student User",
                    "student123",
                    Role.STUDENT
            );

            log.info("Data initialization complete. Test users created/verified.");
        };
    }

    private void createUserIfNotExists(String email, String fullName, String password, Role role) {
        User user = userRepository.findByEmailIgnoreCase(email).orElseGet(User::new);
        user.setEmail(email);
        user.setFullName(fullName);
        user.setRole(role);
        user.setProvider("local");

        if (user.getPassword() == null || !passwordEncoder.matches(password, user.getPassword())) {
            user.setPassword(passwordEncoder.encode(password));
        }

        userRepository.save(user);
        log.info("Upserted test user: {} with role: {}", email, role);
    }
}
