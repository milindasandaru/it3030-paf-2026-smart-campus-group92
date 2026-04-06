package com.smartcampus.hub.mapper;

import com.smartcampus.hub.dto.CommentResponse;
import com.smartcampus.hub.entity.Comment;
import org.springframework.stereotype.Component;

@Component
public class CommentMapper {

    public CommentResponse toResponse(Comment comment) {
        return new CommentResponse(
                comment.getId(),
                comment.getMessage(),
                comment.getTicket().getId(),
                comment.getAuthor().getId(),
                comment.getAuthor().getFullName(),
                comment.getCreatedAt(),
                comment.getUpdatedAt());
    }
}
