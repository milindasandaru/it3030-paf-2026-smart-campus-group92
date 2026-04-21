package com.smartcampus.hub.entity;

import com.smartcampus.hub.util.ResourceStatus;
import com.smartcampus.hub.util.ResourceType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

/**
 * Member 1 — Facilities & Assets Catalogue.
 * Central entity for all bookable resources (lecture halls, labs, equipment, etc.).
 * Other modules reference this entity via @ManyToOne — do NOT modify those relationships here.
 */
@Getter
@Setter
@Entity
@Table(name = "resources")
public class Resource extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Human-readable name, e.g. "Innovation Lab A". Required. */
    @Column(nullable = false, length = 150)
    private String name;

    /** Category of resource (LECTURE_HALL, LAB, MEETING_ROOM, EQUIPMENT, PROJECTOR, CAMERA, OTHER). */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private ResourceType type;

    /** Maximum occupancy for the resource. */
    @Column(nullable = false)
    private Integer capacity;

    /** Physical location, e.g. "Building A, Room 101". Required. */
    @Column(nullable = false, length = 150)
    private String location;

    /** Free-text availability schedule, e.g. "Mon-Fri 08:00-17:00". */
    @Column(name = "availability_windows", columnDefinition = "text")
    private String availabilityWindows;

    /** Optional longer description of the resource. */
    @Column(columnDefinition = "text")
    private String description;

    /**
     * Current operational status.
     * Default: ACTIVE. Can be changed by ADMIN via PUT /api/resources/{id}.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private ResourceStatus status = ResourceStatus.ACTIVE;

    /**
     * Bookings that reference this resource.
     * READ-ONLY from Resource side — Booking module owns this relationship.
     * No cascade: deleting a Resource should be blocked if active Bookings exist
     * (enforced at service layer or via DB FK constraint).
     */
    @OneToMany(mappedBy = "resource", fetch = FetchType.LAZY)
    private List<Booking> bookings = new ArrayList<>();

    /**
     * Attachments uploaded against this resource.
     * READ-ONLY from Resource side — Attachment module owns this relationship.
     */
    @OneToMany(mappedBy = "resource", fetch = FetchType.LAZY)
    private List<Attachment> attachments = new ArrayList<>();

    /**
     * Tickets raised for this resource.
     * READ-ONLY from Resource side — Ticket module owns this relationship.
     */
    @OneToMany(mappedBy = "resource", fetch = FetchType.LAZY)
    private List<Ticket> tickets = new ArrayList<>();
}
