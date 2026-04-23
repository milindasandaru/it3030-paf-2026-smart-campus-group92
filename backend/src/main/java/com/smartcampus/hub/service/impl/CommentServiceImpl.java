package com.smartcampus.hub.service.impl;

import com.smartcampus.hub.dto.CommentRequest;
import com.smartcampus.hub.dto.CommentResponse;
import com.smartcampus.hub.dto.CommentUpdateRequest;
import com.smartcampus.hub.entity.Comment;
import com.smartcampus.hub.entity.Ticket;
import com.smartcampus.hub.entity.User;
import com.smartcampus.hub.exception.AccessDeniedException;
import com.smartcampus.hub.exception.NotFoundException;
import com.smartcampus.hub.mapper.CommentMapper;
import com.smartcampus.hub.repository.CommentRepository;
import com.smartcampus.hub.repository.TicketRepository;
import com.smartcampus.hub.repository.UserRepository;
import com.smartcampus.hub.service.CommentService;
import com.smartcampus.hub.service.NotificationService;
import com.smartcampus.hub.util.NotificationType;
import com.smartcampus.hub.util.Role;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final CommentMapper commentMapper;

    @Override
    @Transactional(readOnly = true)
    public List<CommentResponse> findByTicket(UUID ticketId) {
        return commentRepository.findByTicketId(ticketId).stream().map(commentMapper::toResponse).toList();
    }

    @Override
    public CommentResponse create(UUID ticketId, CommentRequest request) {
        Comment comment = new Comment();
        Ticket ticket = getTicket(ticketId);
        User author = getUser(request.authorId());

        comment.setMessage(request.message());
        comment.setTicket(ticket);
        comment.setAuthor(author);

        Comment saved = commentRepository.save(comment);
        notifyCommentAdded(saved);
        return commentMapper.toResponse(saved);
    }

    @Override
    public CommentResponse update(UUID id, CommentUpdateRequest request) {
        Comment comment = getComment(id);
        User actor = getUser(request.actorUserId());
        boolean isOwner = comment.getAuthor().getId().equals(actor.getId());
        boolean isAdmin = actor.getRole() == Role.ADMIN;
        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("Only comment owner or ADMIN can update this comment");
        }

        comment.setMessage(request.message());
        return commentMapper.toResponse(commentRepository.save(comment));
    }

    @Override
    public void delete(UUID id, UUID actorUserId) {
        Comment comment = getComment(id);
        User actor = getUser(actorUserId);
        boolean isAdmin = actor.getRole() == Role.ADMIN;
        boolean isTicketOwner = comment.getTicket().getReporter().getId().equals(actor.getId());
        if (!isAdmin && !isTicketOwner) {
            throw new AccessDeniedException("Only ticket owner or ADMIN can delete this comment");
        }

        commentRepository.delete(comment);
    }

    private Comment getComment(UUID id) {
        return commentRepository.findById(id).orElseThrow(() -> new NotFoundException("Comment not found: " + id));
    }

    private Ticket getTicket(UUID id) {
        return ticketRepository.findById(id).orElseThrow(() -> new NotFoundException("Ticket not found: " + id));
    }

    private User getUser(UUID id) {
        return userRepository.findById(id).orElseThrow(() -> new NotFoundException("User not found: " + id));
    }

    private void notifyCommentAdded(Comment comment) {
        Set<UUID> recipients = new LinkedHashSet<>();
        recipients.add(comment.getTicket().getReporter().getId());
        if (comment.getTicket().getAssignee() != null) {
            recipients.add(comment.getTicket().getAssignee().getId());
        }
        for (UUID recipientId : recipients) {
            if (recipientId.equals(comment.getAuthor().getId())) {
                continue;
            }
            notificationService.createNotification(
                    recipientId,
                    "New comment on ticket: " + comment.getTicket().getTitle(),
                    NotificationType.TICKET_IN_PROGRESS);
        }
    }
}
