package com.smartcampus.hub.repository;

import com.smartcampus.hub.entity.Ticket;
import com.smartcampus.hub.util.TicketStatus;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketRepository extends JpaRepository<Ticket, UUID> {

	List<Ticket> findByStatus(TicketStatus status);

	List<Ticket> findByReporterId(UUID reporterId);

	List<Ticket> findByAssigneeId(UUID assigneeId);
}
