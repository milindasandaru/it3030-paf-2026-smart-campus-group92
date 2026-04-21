package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.CommentRequest;
import com.smartcampus.hub.dto.CommentResponse;
import com.smartcampus.hub.dto.CommentUpdateRequest;
import java.util.List;
import java.util.UUID;

public interface CommentService {

    List<CommentResponse> findByTicket(UUID ticketId);

    CommentResponse create(UUID ticketId, CommentRequest request);

    CommentResponse update(UUID id, CommentUpdateRequest request);

    void delete(UUID id, UUID actorUserId);
}
