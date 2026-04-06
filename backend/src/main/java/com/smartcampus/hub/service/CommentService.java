package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.CommentRequest;
import com.smartcampus.hub.dto.CommentResponse;
import java.util.List;
import java.util.UUID;

public interface CommentService {

    List<CommentResponse> findAll();

    CommentResponse findById(UUID id);

    CommentResponse create(CommentRequest request);

    CommentResponse update(UUID id, CommentRequest request);

    void delete(UUID id);
}
