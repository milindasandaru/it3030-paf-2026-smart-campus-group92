package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.CommentRequest;
import com.smartcampus.hub.dto.CommentResponse;
import com.smartcampus.hub.dto.CommentUpdateRequest;
import com.smartcampus.hub.service.CommentService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @GetMapping("/ticket/{ticketId}")
    public List<CommentResponse> getByTicket(@PathVariable UUID ticketId) {
        return commentService.findByTicket(ticketId);
    }

    @PostMapping("/ticket/{ticketId}")
    @ResponseStatus(HttpStatus.CREATED)
    public CommentResponse create(@PathVariable UUID ticketId, @Valid @RequestBody CommentRequest request) {
        return commentService.create(ticketId, request);
    }

    @PutMapping("/{id}")
    public CommentResponse update(@PathVariable UUID id, @Valid @RequestBody CommentUpdateRequest request) {
        return commentService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id, @RequestParam UUID actorUserId) {
        commentService.delete(id, actorUserId);
    }
}
