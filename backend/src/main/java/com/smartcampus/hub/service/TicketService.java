package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.TicketRequest;
import com.smartcampus.hub.dto.TicketResponse;
import java.util.List;
import java.util.UUID;

public interface TicketService {

    List<TicketResponse> findAll();

    TicketResponse findById(UUID id);

    TicketResponse create(TicketRequest request);

    TicketResponse update(UUID id, TicketRequest request);

    void delete(UUID id);
}
