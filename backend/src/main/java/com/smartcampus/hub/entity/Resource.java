package com.smartcampus.hub.entity;

import com.smartcampus.hub.util.ResourceStatus;
import com.smartcampus.hub.util.ResourceType;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

@Getter
@Setter
@Entity
@Table(name = "resources")
public class Resource extends AuditableEntity {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(columnDefinition = "text")
    private String description;

    @Column(nullable = false, length = 150)
    private String location;

    @Column
    private Integer capacity;

    @Column(length = 255)
    private String availabilityWindows;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private ResourceType type = ResourceType.LECTURE_HALL;

    @Column
    private Integer totalUnits;

    @Column
    private Integer bookingSlotIntervalMinutes;

    @Column
    private Integer minBookingDurationMinutes;

    @Column
    private Integer maxBookingDurationMinutes;

    @Column
    private Integer minAdvanceBookingMinutes;

    @Column(nullable = false)
    private boolean requiresApproval = true;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private ResourceStatus status = ResourceStatus.AVAILABLE;

    @OneToMany(mappedBy = "resource", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Booking> bookings = new ArrayList<>();

    @OneToMany(mappedBy = "resource", cascade = CascadeType.ALL)
    private List<Attachment> attachments = new ArrayList<>();

    @OneToMany(mappedBy = "resource")
    private List<Ticket> tickets = new ArrayList<>();
}
