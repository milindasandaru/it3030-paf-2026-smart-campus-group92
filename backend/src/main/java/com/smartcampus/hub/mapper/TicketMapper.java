package com.smartcampus.hub.mapper;

import com.smartcampus.hub.dto.TicketResponse;
import com.smartcampus.hub.entity.Ticket;
import java.time.Duration;
import org.springframework.stereotype.Component;

@Component
public class TicketMapper {

    public TicketResponse toResponse(Ticket ticket) {
        return new TicketResponse(
                ticket.getId(),
                ticket.getTitle(),
                ticket.getDescription(),
                ticket.getCategory(),
                ticket.getContactDetails(),
                ticket.getPriority(),
                ticket.getStatus(),
                ticket.getResolutionNotes(),
                ticket.getResource() != null ? ticket.getResource().getId() : null,
                ticket.getResource() != null ? ticket.getResource().getName() : null,
                ticket.getReporter().getId(),
                ticket.getReporter().getFullName(),
                ticket.getReporter().getEmail(),
                ticket.getAssignee() != null ? ticket.getAssignee().getId() : null,
                ticket.getAssignee() != null ? ticket.getAssignee().getFullName() : null,
                ticket.getFirstResponseAt(),
                ticket.getResolvedAt(),
                minutesBetween(ticket.getCreatedAt(), ticket.getFirstResponseAt()),
                minutesBetween(ticket.getCreatedAt(), ticket.getResolvedAt()),
                ticket.getCreatedAt(),
                ticket.getUpdatedAt());
    }

    private Long minutesBetween(java.time.OffsetDateTime from, java.time.OffsetDateTime to) {
        if (from == null || to == null) {
            return null;
        }
        return Duration.between(from, to).toMinutes();
    }
}
