package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.TicketActionRequest;
import com.smartcampus.hub.dto.TicketAssignRequest;
import com.smartcampus.hub.dto.TicketCreateRequest;
import com.smartcampus.hub.dto.TicketRejectRequest;
import com.smartcampus.hub.dto.TicketResolveRequest;
import com.smartcampus.hub.dto.TicketResponse;
import com.smartcampus.hub.dto.TicketUpdateDetailsRequest;
import java.util.List;
import java.util.UUID;

public interface TicketService {

    List<TicketResponse> findAll();

    TicketResponse findById(UUID id);

    TicketResponse create(TicketCreateRequest request);

    TicketResponse updateDetails(UUID id, TicketUpdateDetailsRequest request);

    TicketResponse assign(UUID id, TicketAssignRequest request);

    TicketResponse startWork(UUID id, TicketActionRequest request);

    TicketResponse resolve(UUID id, TicketResolveRequest request);

    TicketResponse close(UUID id, TicketActionRequest request);

    TicketResponse reject(UUID id, TicketRejectRequest request);

    TicketResponse reopen(UUID id, TicketActionRequest request);

    void delete(UUID id, UUID actorUserId);
}
