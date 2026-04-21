package com.smartcampus.hub.config;

import com.smartcampus.hub.entity.Booking;
import com.smartcampus.hub.entity.Resource;
import com.smartcampus.hub.entity.User;
import com.smartcampus.hub.repository.BookingRepository;
import com.smartcampus.hub.repository.ResourceRepository;
import com.smartcampus.hub.repository.UserRepository;
import com.smartcampus.hub.util.BookingStatus;
import com.smartcampus.hub.util.ResourceStatus;
import com.smartcampus.hub.util.ResourceType;
import com.smartcampus.hub.util.Role;
import java.time.OffsetDateTime;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final BookingRepository bookingRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        User admin = upsertUser("Admin User", "admin@smartcampus.edu", "Admin@123", Role.ADMIN);
        User lecturer = upsertUser("Lecturer User", "lecturer@smartcampus.edu", "Lecturer@123", Role.LECTURER);
        User student = upsertUser("Student User", "student@smartcampus.edu", "Student@123", Role.STUDENT);

        Resource lab = upsertResource(
                "Computer Lab 1",
                "Main IT lab with student workstations",
                "Block A - L1",
                ResourceType.LAB,
                50,
            "Mon-Fri 08:00-17:00");

        Resource studyArea = upsertResource(
                "Library Study Area 1",
                "Shared quiet study area",
                "Library - L2",
            ResourceType.MEETING_ROOM,
                20,
            "Mon-Fri 08:00-17:00");

        OffsetDateTime bookingStart = OffsetDateTime.now().plusDays(1).withMinute(0).withSecond(0).withNano(0);
        createBookingIfAbsent(student, studyArea, bookingStart, bookingStart.plusHours(2));

        OffsetDateTime lecturerStart = OffsetDateTime.now().plusDays(2).withMinute(0).withSecond(0).withNano(0);
        createBookingIfAbsent(lecturer, lab, lecturerStart, lecturerStart.plusHours(1));

        if (admin == null) {
            throw new IllegalStateException("Seed failed to create admin user");
        }
    }

    private User upsertUser(String fullName, String email, String rawPassword, Role role) {
        User user = userRepository.findByEmailIgnoreCase(email).orElseGet(User::new);
        user.setFullName(fullName);
        user.setEmail(email.toLowerCase());
        user.setRole(role);
        user.setProvider("local");

        if (user.getPassword() == null || !passwordEncoder.matches(rawPassword, user.getPassword())) {
            user.setPassword(passwordEncoder.encode(rawPassword));
        }

        return userRepository.save(user);
    }

    private Resource upsertResource(
            String name,
            String description,
            String location,
            ResourceType type,
            Integer capacity,
            String availabilityWindows) {
        Optional<Resource> existing = resourceRepository.findAll().stream()
                .filter(resource -> resource.getName() != null && resource.getName().equalsIgnoreCase(name))
                .findFirst();

        Resource resource = existing.orElseGet(Resource::new);
        resource.setName(name);
        resource.setDescription(description);
        resource.setLocation(location);
        resource.setType(type);
        resource.setCapacity(capacity);
        resource.setAvailabilityWindows(availabilityWindows);
        resource.setStatus(ResourceStatus.ACTIVE);
        return resourceRepository.save(resource);
    }

    private void createBookingIfAbsent(User user, Resource resource, OffsetDateTime start, OffsetDateTime end) {
        boolean exists = bookingRepository.existsConflict(resource.getId(), start, end, null);
        if (exists) {
            return;
        }

        Booking booking = new Booking();
        booking.setTitle("Seed booking");
        booking.setRequester(user);
        booking.setResource(resource);
        booking.setStartTime(start);
        booking.setEndTime(end);
        booking.setStatus(BookingStatus.APPROVED);
        bookingRepository.save(booking);
    }
}
