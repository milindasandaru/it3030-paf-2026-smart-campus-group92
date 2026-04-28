package com.smartcampus.hub.config;

import com.smartcampus.hub.entity.Booking;
import com.smartcampus.hub.entity.Comment;
import com.smartcampus.hub.entity.Notification;
import com.smartcampus.hub.entity.Resource;
import com.smartcampus.hub.entity.Ticket;
import com.smartcampus.hub.entity.User;
import com.smartcampus.hub.repository.BookingRepository;
import com.smartcampus.hub.repository.CommentRepository;
import com.smartcampus.hub.repository.NotificationRepository;
import com.smartcampus.hub.repository.ResourceRepository;
import com.smartcampus.hub.repository.TicketRepository;
import com.smartcampus.hub.repository.UserRepository;
import com.smartcampus.hub.util.BookingStatus;
import com.smartcampus.hub.util.NotificationType;
import com.smartcampus.hub.util.ResourceStatus;
import com.smartcampus.hub.util.ResourceType;
import com.smartcampus.hub.util.Role;
import com.smartcampus.hub.util.TicketPriority;
import com.smartcampus.hub.util.TicketStatus;
import java.time.OffsetDateTime;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;
    private final CommentRepository commentRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        log.info("DataLoader: seeding demo data...");

        // ── Users ──────────────────────────────────────────────────────────
        User admin      = upsertUser("Admin User",       "admin@smartcampus.edu",      "admin123",       Role.ADMIN);
        User tech       = upsertUser("Tech Perera",      "tech@smartcampus.edu",       "tech123",        Role.TECHNICIAN);
        User lecturer   = upsertUser("Dr. Nimal Silva",  "lecturer@smartcampus.edu",   "lecturer123",    Role.LECTURER);
        User lecturer2  = upsertUser("Prof. Amara Dias", "amara@smartcampus.edu",      "amara123",       Role.LECTURER);
        User student    = upsertUser("Kasun Fernando",   "student@smartcampus.edu",    "student123",     Role.STUDENT);
        User student2   = upsertUser("Malini Wijesinghe", "malini@smartcampus.edu",     "malini123",      Role.STUDENT);
        User staff      = upsertUser("Suresh Bandara",   "staff@smartcampus.edu",      "staff123",       Role.STAFF);

        // ── Resources ──────────────────────────────────────────────────────
        // Labs
        Resource lab1     = upsertResource("Computer Lab A",          "50-seat fully equipped IT lab with dual monitors",          "Block A – Level 1",  ResourceType.LAB,          50,  "Mon-Fri 08:00-20:00", ResourceStatus.ACTIVE);
        Resource lab2     = upsertResource("Electronics Lab",         "Advanced electronics & IoT prototyping lab",                "Block B – Level 2",  ResourceType.LAB,          30,  "Mon-Sat 09:00-18:00", ResourceStatus.ACTIVE);
        Resource lab3     = upsertResource("Computer Lab B",          "30-seat lab for software engineering practicals",           "Block A – Level 2",  ResourceType.LAB,          30,  "Mon-Fri 08:00-18:00", ResourceStatus.ACTIVE);
        Resource lab4     = upsertResource("Networking Lab",          "Cisco-equipped lab for network configuration practicals",   "Block B – Level 1",  ResourceType.LAB,          24,  "Mon-Fri 09:00-17:00", ResourceStatus.MAINTENANCE);
        // Lecture halls
        Resource hall1    = upsertResource("Main Lecture Hall",       "Large 200-seat lecture theatre with AV system",             "Block C – Level 0",  ResourceType.LECTURE_HALL, 200, "Mon-Fri 07:00-21:00", ResourceStatus.ACTIVE);
        Resource hall2    = upsertResource("Seminar Room 101",        "60-seat seminar room with whiteboard & projector",          "Block A – Level 2",  ResourceType.LECTURE_HALL, 60,  "Mon-Fri 08:00-18:00", ResourceStatus.ACTIVE);
        Resource hall3    = upsertResource("Seminar Room 102",        "40-seat seminar room with interactive display",             "Block A – Level 2",  ResourceType.LECTURE_HALL, 40,  "Mon-Fri 08:00-20:00", ResourceStatus.ACTIVE);
        Resource hall4    = upsertResource("Auditorium",              "500-seat auditorium for large events and graduations",      "Main Block – Level 0", ResourceType.LECTURE_HALL, 500, "Mon-Sun 08:00-22:00", ResourceStatus.ACTIVE);
        // Meeting rooms
        Resource meeting1 = upsertResource("Innovation Hub",         "Collaborative meeting space with smart TV",                 "Library – Level 3",  ResourceType.MEETING_ROOM, 12,  "Mon-Fri 08:00-22:00", ResourceStatus.ACTIVE);
        Resource meeting2 = upsertResource("Staff Meeting Room",     "Small meeting room for staff use",                          "Admin Block – L1",   ResourceType.MEETING_ROOM, 8,   "Mon-Fri 08:00-17:00", ResourceStatus.ACTIVE);
        Resource meeting3 = upsertResource("Board Room",             "Executive boardroom with video conferencing setup",         "Admin Block – L2",   ResourceType.MEETING_ROOM, 16,  "Mon-Fri 08:00-18:00", ResourceStatus.ACTIVE);
        // Equipment
        Resource projector1  = upsertResource("Epson Projector 4K",     "4K portable projector – bookable for events",           "AV Store – Block A", ResourceType.PROJECTOR,    1,   "Mon-Fri 08:00-18:00", ResourceStatus.ACTIVE);
        Resource projector2  = upsertResource("Laser Projector XL",     "High-brightness laser projector for large halls",        "AV Store – Block A", ResourceType.PROJECTOR,    1,   "Mon-Fri 08:00-18:00", ResourceStatus.ACTIVE);
        Resource camera1     = upsertResource("Sony DSLR Camera Kit",   "Professional DSLR with tripod & lenses",                "AV Store – Block A", ResourceType.CAMERA,       1,   "Mon-Fri 09:00-17:00", ResourceStatus.ACTIVE);
        Resource camera2     = upsertResource("Video Camera Kit",       "HD camcorder with tripod for event recording",           "AV Store – Block B", ResourceType.CAMERA,       1,   "Mon-Fri 09:00-17:00", ResourceStatus.ACTIVE);
        // Study areas
        Resource studyArea   = upsertResource("Library Study Area",     "Open quiet study zone – 40 seats",                      "Library – Level 2",  ResourceType.STUDY_AREA,   40,  "Mon-Sun 07:00-23:00", ResourceStatus.ACTIVE);
        Resource studyArea2  = upsertResource("Postgraduate Study Room", "Silent study room for postgraduate students only",        "Library – Level 3",  ResourceType.STUDY_AREA,   20,  "Mon-Sun 08:00-22:00", ResourceStatus.ACTIVE);
        // Out of service / maintenance
        upsertResource("Old Physics Lab",        "Under renovation – not bookable",                          "Block D – Level 1",  ResourceType.LAB,          20,  "N/A",                 ResourceStatus.OUT_OF_SERVICE);
        upsertResource("Multimedia Studio",      "Audio/video production studio – equipment being upgraded", "Block C – Level 2",  ResourceType.OTHER,        8,   "N/A",                 ResourceStatus.MAINTENANCE);

        // ── Bookings ───────────────────────────────────────────────────────
        OffsetDateTime base = OffsetDateTime.now().withMinute(0).withSecond(0).withNano(0);

        // Approved bookings – past
        seedBooking("Semester Project Presentation",   lecturer,  hall1,      base.minusDays(3).plusHours(9),   base.minusDays(3).plusHours(12),  BookingStatus.APPROVED,  null,                                                             40);
        seedBooking("Lab Session – CS3040",            lecturer,  lab1,       base.minusDays(1).plusHours(13),  base.minusDays(1).plusHours(15),  BookingStatus.APPROVED,  null,                                                             48);
        seedBooking("Software Eng Practical",          lecturer,  lab3,       base.minusDays(2).plusHours(10),  base.minusDays(2).plusHours(12),  BookingStatus.APPROVED,  null,                                                             28);
        seedBooking("Board Review Meeting",            staff,     meeting3,   base.minusDays(4).plusHours(9),   base.minusDays(4).plusHours(11),  BookingStatus.APPROVED,  null,                                                             12);
        seedBooking("Annual Science Exhibition",       lecturer2, hall4,      base.minusDays(5).plusHours(8),   base.minusDays(5).plusHours(17),  BookingStatus.APPROVED,  null,                                                             350);

        // Approved bookings – future
        seedBooking("Research Group Meeting",          lecturer2, meeting1,   base.plusDays(1).plusHours(10),   base.plusDays(1).plusHours(12),   BookingStatus.APPROVED,  null,                                                             8);
        seedBooking("IoT Workshop",                    lecturer2, lab2,       base.plusDays(2).plusHours(9),    base.plusDays(2).plusHours(17),   BookingStatus.APPROVED,  null,                                                             28);
        seedBooking("Study Group Session",             student,   studyArea,  base.plusDays(1).plusHours(14),   base.plusDays(1).plusHours(16),   BookingStatus.APPROVED,  null,                                                             6);
        seedBooking("PG Research Writing Session",     student2,  studyArea2, base.plusDays(2).plusHours(9),    base.plusDays(2).plusHours(13),   BookingStatus.APPROVED,  null,                                                             4);
        seedBooking("Network Lab Practical – Group B", lecturer,  lab4,       base.plusDays(3).plusHours(13),   base.plusDays(3).plusHours(15),   BookingStatus.APPROVED,  null,                                                             22);
        seedBooking("Department Town Hall",            staff,     hall3,      base.plusDays(4).plusHours(10),   base.plusDays(4).plusHours(12),   BookingStatus.APPROVED,  null,                                                             35);
        seedBooking("Video Recording – Final Demo",    student2,  camera2,    base.plusDays(1).plusHours(11),   base.plusDays(1).plusHours(13),   BookingStatus.APPROVED,  null,                                                             1);
        seedBooking("Guest Speaker Event",             lecturer,  hall4,      base.plusDays(7).plusHours(14),   base.plusDays(7).plusHours(17),   BookingStatus.APPROVED,  null,                                                             400);

        // Pending bookings
        seedBooking("Guest Lecture – AI in Healthcare", lecturer,  hall1,      base.plusDays(5).plusHours(10),   base.plusDays(5).plusHours(12),   BookingStatus.PENDING,   null,                                                             150);
        seedBooking("Photography Club Event",          student2,  camera1,    base.plusDays(3).plusHours(9),    base.plusDays(3).plusHours(17),   BookingStatus.PENDING,   null,                                                             1);
        seedBooking("Staff Town Hall",                 staff,     meeting2,   base.plusDays(4).plusHours(14),   base.plusDays(4).plusHours(16),   BookingStatus.PENDING,   null,                                                             7);
        seedBooking("Seminar – Cloud Computing",       lecturer2, hall3,      base.plusDays(6).plusHours(9),    base.plusDays(6).plusHours(11),   BookingStatus.PENDING,   null,                                                             38);
        seedBooking("Projector for Open Day Booth",    student,   projector2, base.plusDays(5).plusHours(8),    base.plusDays(5).plusHours(18),   BookingStatus.PENDING,   null,                                                             1);
        seedBooking("Board Room – External Meeting",   staff,     meeting3,   base.plusDays(8).plusHours(10),   base.plusDays(8).plusHours(12),   BookingStatus.PENDING,   null,                                                             10);

        // Rejected bookings (with reasons)
        seedBooking("Weekend Hackathon",               student,   lab1,       base.plusDays(6).plusHours(8),    base.plusDays(6).plusHours(20),   BookingStatus.REJECTED,  "Lab not available on weekends – please rebook for a weekday",      20);
        seedBooking("Projector – Extra Screening",     student2,  projector1, base.minusDays(2).plusHours(18),  base.minusDays(2).plusHours(21),  BookingStatus.REJECTED,  "Outside approved hours for equipment loans",                       1);
        seedBooking("Overnight Study Room",            student,   studyArea2, base.minusDays(1).plusHours(22),  base.minusDays(1).plusHours(24),  BookingStatus.REJECTED,  "Postgraduate study room closes at 22:00",                          2);
        seedBooking("Auditorium – Private Event",      student2,  hall4,      base.plusDays(10).plusHours(18),  base.plusDays(10).plusHours(23),  BookingStatus.REJECTED,  "Auditorium not available for private non-academic events",          50);

        // Cancelled bookings
        seedBooking("Cancelled Study Session",         student,   studyArea,  base.plusDays(7).plusHours(10),   base.plusDays(7).plusHours(12),   BookingStatus.CANCELLED, null,                                                             3);
        seedBooking("Cancelled Lab Booking",           lecturer,  lab2,       base.plusDays(9).plusHours(9),    base.plusDays(9).plusHours(11),   BookingStatus.CANCELLED, null,                                                             15);

        // ── Tickets ────────────────────────────────────────────────────────
        // OPEN tickets
        Ticket t1 = seedTicket("Projector not working in Hall C",
            "Projector shows 'No Signal' error. Already tried replacing HDMI cable.",
            "EQUIPMENT", "ext:2210", TicketPriority.HIGH, TicketStatus.OPEN, hall1, student, null, null);

        Ticket t2 = seedTicket("Air conditioning broken in Lab A",
            "AC unit has been making loud noise and stopped cooling. Room temperature is 32°C.",
            "MAINTENANCE", "ext:2301", TicketPriority.CRITICAL, TicketStatus.OPEN, lab1, lecturer, null, null);

        // IN_PROGRESS tickets
        Ticket t3 = seedTicket("Network switch failure – Block B",
            "All computers on Block B Level 2 have lost network connectivity since 8am.",
            "NETWORK", "ext:2215", TicketPriority.CRITICAL, TicketStatus.IN_PROGRESS, lab2, lecturer2, tech, null);

        seedTicket("Broken chair in Seminar Room 101",
            "Three chairs are broken and pose a safety hazard.",
            "FACILITIES", "ext:2201", TicketPriority.MEDIUM, TicketStatus.IN_PROGRESS, hall2, student2, tech, null);

        // RESOLVED tickets

        Ticket t5 = seedTicket("Whiteboard marker issue",
            "No dry-erase markers available in seminar rooms 101-105.",
            "SUPPLIES", "ext:2201", TicketPriority.LOW, TicketStatus.RESOLVED, hall2, staff, tech, "Restocked all markers. 10 sets placed in each room.");

        Ticket t6 = seedTicket("Broken door handle – Meeting Room",
            "Door handle on Innovation Hub broken, door cannot be locked properly.",
            "FACILITIES", "ext:2301", TicketPriority.HIGH, TicketStatus.RESOLVED, meeting1, lecturer, tech, "Door handle replaced by maintenance team.");

        // CLOSED ticket
        Ticket t7 = seedTicket("WiFi down in Library",
            "Library WiFi access point on Level 2 not broadcasting. Students unable to connect.",
            "NETWORK", "ext:2399", TicketPriority.HIGH, TicketStatus.CLOSED, studyArea, student, tech, "Access point firmware updated and restarted. Issue resolved.");

        // REJECTED ticket
        seedTicket("Request for extra monitors in Lab",
            "Requesting 10 additional monitors for Computer Lab A for exam period.",
            "EQUIPMENT", "ext:2210", TicketPriority.MEDIUM, TicketStatus.REJECTED, lab1, student2, null, "This request is outside the scope of incident tickets. Please raise via Admin procurement.");

        // ── Comments ───────────────────────────────────────────────────────
        seedComment(t1, student,  "I've confirmed it happens across all HDMI inputs. Might be the projector lens or internal board.");
        seedComment(t1, tech,     "Logged – will inspect tomorrow morning at 8am. Please leave the room unlocked.");
        seedComment(t2, lecturer, "The situation is getting worse. Please prioritise before tomorrow's morning lectures.");
        seedComment(t3, tech,     "Replaced the faulty port on the switch. Testing connectivity now.");
        seedComment(t3, lecturer2, "Still seeing packet loss on 3 machines. Can you check again?");
        seedComment(t3, tech,     "Confirmed - those 3 machines had bad NICs, not the switch. Replacing NICs now.");
        seedComment(t5, staff,    "Thank you, resolved very quickly!");
        seedComment(t6, lecturer, "Confirmed fixed. Door locks properly now. Thanks.");
        seedComment(t7, student,  "WiFi is working again, thank you.");

        // ── Notifications ──────────────────────────────────────────────────
        // Admin – pending booking approvals
        seedNotification(admin,    "New booking request: 'Guest Lecture – AI in Healthcare' is awaiting approval.",  NotificationType.BOOKING_CREATED,  false);
        seedNotification(admin,    "New booking request: 'Photography Club Event' is awaiting approval.",            NotificationType.BOOKING_CREATED,  false);
        seedNotification(admin,    "New booking request: 'Staff Town Hall' is awaiting approval.",                   NotificationType.BOOKING_CREATED,  true);
        seedNotification(admin,    "New booking request: 'Seminar – Cloud Computing' is awaiting approval.",         NotificationType.BOOKING_CREATED,  false);
        seedNotification(admin,    "New booking request: 'Projector for Open Day Booth' is awaiting approval.",      NotificationType.BOOKING_CREATED,  false);
        seedNotification(admin,    "New booking request: 'Board Room – External Meeting' is awaiting approval.",     NotificationType.BOOKING_CREATED,  false);
        // Lecturer – booking approvals and rejections
        seedNotification(lecturer, "Your booking 'Semester Project Presentation' has been approved.",                NotificationType.BOOKING_APPROVED, true);
        seedNotification(lecturer, "Your booking 'Lab Session – CS3040' has been approved.",                        NotificationType.BOOKING_APPROVED, true);
        seedNotification(lecturer, "Your booking 'Software Eng Practical' has been approved.",                      NotificationType.BOOKING_APPROVED, true);
        seedNotification(lecturer, "Your booking 'Guest Speaker Event' has been approved.",                         NotificationType.BOOKING_APPROVED, false);
        seedNotification(lecturer, "Your booking 'Cancelled Lab Booking' has been cancelled.",                      NotificationType.BOOKING_REJECTED, true);
        // Lecturer2 – booking updates
        seedNotification(lecturer2, "Your booking 'Annual Science Exhibition' has been approved.",                   NotificationType.BOOKING_APPROVED, true);
        seedNotification(lecturer2, "Your booking 'Research Group Meeting' has been approved.",                      NotificationType.BOOKING_APPROVED, true);
        seedNotification(lecturer2, "Your booking 'IoT Workshop' has been approved.",                               NotificationType.BOOKING_APPROVED, false);
        // Student – booking rejections and approvals
        seedNotification(student,  "Your booking 'Weekend Hackathon' has been rejected: Lab not available on weekends.", NotificationType.BOOKING_REJECTED, false);
        seedNotification(student,  "Your booking 'Overnight Study Room' has been rejected: Study room closes at 22:00.", NotificationType.BOOKING_REJECTED, false);
        seedNotification(student,  "Your booking 'Study Group Session' has been approved.",                         NotificationType.BOOKING_APPROVED, true);
        // Student2 – booking updates
        seedNotification(student2, "Your booking 'Projector – Extra Screening' has been rejected.",                 NotificationType.BOOKING_REJECTED, true);
        seedNotification(student2, "Your booking 'Auditorium – Private Event' has been rejected.",                  NotificationType.BOOKING_REJECTED, false);
        seedNotification(student2, "Your booking 'PG Research Writing Session' has been approved.",                 NotificationType.BOOKING_APPROVED, true);
        seedNotification(student2, "Your booking 'Video Recording – Final Demo' has been approved.",                NotificationType.BOOKING_APPROVED, false);
        // Staff – booking updates
        seedNotification(staff,    "Your booking 'Board Review Meeting' has been approved.",                        NotificationType.BOOKING_APPROVED, true);
        seedNotification(staff,    "Your booking 'Department Town Hall' has been approved.",                        NotificationType.BOOKING_APPROVED, false);
        // Ticket notifications
        seedNotification(student,  "Your ticket 'Projector not working in Hall C' has been created.",               NotificationType.TICKET_CREATED,   true);
        seedNotification(lecturer, "Your ticket 'Air conditioning broken in Lab A' has been created.",              NotificationType.TICKET_CREATED,   false);
        seedNotification(tech,     "You have been assigned to ticket: 'Network switch failure – Block B'.",          NotificationType.TICKET_ASSIGNED,  false);
        seedNotification(tech,     "You have been assigned to ticket: 'Broken chair in Seminar Room 101'.",          NotificationType.TICKET_ASSIGNED,  false);
        seedNotification(lecturer2, "Your ticket 'Network switch failure - Block B' is now IN_PROGRESS.",            NotificationType.TICKET_IN_PROGRESS, true);
        seedNotification(lecturer, "Your ticket 'Broken door handle – Meeting Room' has been resolved.",            NotificationType.TICKET_RESOLVED,  true);
        seedNotification(student,  "Your ticket 'WiFi down in Library' has been closed.",                           NotificationType.TICKET_CLOSED,    true);
        seedNotification(staff,    "Your ticket 'Whiteboard marker issue' has been resolved.",                      NotificationType.TICKET_RESOLVED,  true);

        log.info("DataLoader: seeding complete.");
    }

    // ── Helpers ────────────────────────────────────────────────────────────

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

    private Resource upsertResource(String name, String description, String location,
            ResourceType type, Integer capacity, String windows, ResourceStatus status) {
        Optional<Resource> existing = resourceRepository.findAll().stream()
                .filter(r -> r.getName() != null && r.getName().equalsIgnoreCase(name))
                .findFirst();
        Resource r = existing.orElseGet(Resource::new);
        r.setName(name);
        r.setDescription(description);
        r.setLocation(location);
        r.setType(type);
        r.setCapacity(capacity);
        r.setAvailabilityWindows(windows);
        r.setStatus(status);
        return resourceRepository.save(r);
    }

    private void seedBooking(String title, User requester, Resource resource,
            OffsetDateTime start, OffsetDateTime end, BookingStatus status,
            String rejectionReason, Integer attendees) {
        boolean conflict = bookingRepository.existsConflict(resource.getId(), start, end, null);
        if (conflict) {
            return;
        }
        Booking b = new Booking();
        b.setTitle(title);
        b.setRequester(requester);
        b.setResource(resource);
        b.setStartTime(start);
        b.setEndTime(end);
        b.setStatus(status);
        b.setRejectionReason(rejectionReason);
        b.setAttendeeCount(attendees);
        b.setPurpose(title);
        bookingRepository.save(b);
    }

    private Ticket seedTicket(String title, String description, String category,
            String contactDetails, TicketPriority priority, TicketStatus status,
            Resource resource, User reporter, User assignee, String resolutionNotes) {
        boolean exists = ticketRepository.findByReporterId(reporter.getId()).stream()
                .anyMatch(t -> t.getTitle().equalsIgnoreCase(title));
        if (exists) {
            return ticketRepository.findByReporterId(reporter.getId()).stream()
                    .filter(t -> t.getTitle().equalsIgnoreCase(title)).findFirst().orElseThrow();
        }
        Ticket t = new Ticket();
        t.setTitle(title);
        t.setDescription(description);
        t.setCategory(category);
        t.setContactDetails(contactDetails);
        t.setPriority(priority);
        t.setStatus(status);
        t.setResource(resource);
        t.setReporter(reporter);
        t.setAssignee(assignee);
        t.setResolutionNotes(resolutionNotes);
        return ticketRepository.save(t);
    }

    private void seedComment(Ticket ticket, User author, String message) {
        boolean exists = commentRepository.findByTicketIdOrderByCreatedAtAsc(ticket.getId()).stream()
                .anyMatch(c -> c.getMessage().equalsIgnoreCase(message));
        if (exists) {
            return;
        }
        Comment c = new Comment();
        c.setTicket(ticket);
        c.setAuthor(author);
        c.setMessage(message);
        commentRepository.save(c);
    }

    private void seedNotification(User recipient, String message, NotificationType type, boolean read) {
        boolean exists = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(recipient.getId())
                .stream().anyMatch(n -> n.getMessage().equalsIgnoreCase(message));
        if (exists) {
            return;
        }
        Notification n = new Notification();
        n.setRecipient(recipient);
        n.setMessage(message);
        n.setNotificationType(type);
        n.setReadFlag(read);
        notificationRepository.save(n);
    }
}
