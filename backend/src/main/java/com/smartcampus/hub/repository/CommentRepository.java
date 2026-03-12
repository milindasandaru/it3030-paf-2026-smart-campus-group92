package com.smartcampus.hub.repository;

import com.smartcampus.hub.entity.Comment;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, UUID> {

    List<Comment> findByTicketId(UUID ticketId);
}
