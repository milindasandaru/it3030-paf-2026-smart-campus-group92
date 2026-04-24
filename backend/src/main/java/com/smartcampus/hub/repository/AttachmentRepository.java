package com.smartcampus.hub.repository;

import com.smartcampus.hub.entity.Attachment;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AttachmentRepository extends JpaRepository<Attachment, UUID> {

	List<Attachment> findByTicketIdOrderByCreatedAtDesc(UUID ticketId);

	long countByTicketId(UUID ticketId);
}
