package com.smartcampus.hub.service.impl;

import com.smartcampus.hub.dto.CommentRequest;
import com.smartcampus.hub.dto.CommentResponse;
import com.smartcampus.hub.entity.Comment;
import com.smartcampus.hub.entity.Ticket;
import com.smartcampus.hub.entity.User;
import com.smartcampus.hub.exception.NotFoundException;
import com.smartcampus.hub.mapper.CommentMapper;
import com.smartcampus.hub.repository.CommentRepository;
import com.smartcampus.hub.repository.TicketRepository;
import com.smartcampus.hub.repository.UserRepository;
import com.smartcampus.hub.service.CommentService;
import java.util.List;
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
    private final CommentMapper commentMapper;

    @Override
    @Transactional(readOnly = true)
    public List<CommentResponse> findAll() {
        return commentRepository.findAll().stream().map(commentMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CommentResponse findById(UUID id) {
        return commentMapper.toResponse(getComment(id));
    }

    @Override
    public CommentResponse create(CommentRequest request) {
        Comment comment = new Comment();
        applyRequest(comment, request);
        return commentMapper.toResponse(commentRepository.save(comment));
    }

    @Override
    public CommentResponse update(UUID id, CommentRequest request) {
        Comment comment = getComment(id);
        applyRequest(comment, request);
        return commentMapper.toResponse(commentRepository.save(comment));
    }

    @Override
    public void delete(UUID id) {
        commentRepository.delete(getComment(id));
    }

    private void applyRequest(Comment comment, CommentRequest request) {
        Ticket ticket = ticketRepository
                .findById(request.ticketId())
                .orElseThrow(() -> new NotFoundException("Ticket not found: " + request.ticketId()));
        User author = userRepository
                .findById(request.authorId())
                .orElseThrow(() -> new NotFoundException("User not found: " + request.authorId()));

        comment.setMessage(request.message());
        comment.setTicket(ticket);
        comment.setAuthor(author);
    }

    private Comment getComment(UUID id) {
        return commentRepository.findById(id).orElseThrow(() -> new NotFoundException("Comment not found: " + id));
    }
}
