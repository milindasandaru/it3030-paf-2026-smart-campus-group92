package com.smartcampus.hub.repository;

import com.smartcampus.hub.entity.Ticket;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketRepository extends JpaRepository<Ticket, UUID> {}
