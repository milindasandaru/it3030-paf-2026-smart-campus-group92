package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.TicketActionRequest;
import com.smartcampus.hub.dto.TicketAssignRequest;
import com.smartcampus.hub.dto.TicketCreateRequest;
import com.smartcampus.hub.dto.TicketRejectRequest;
import com.smartcampus.hub.dto.TicketResolveRequest;
import com.smartcampus.hub.dto.TicketResponse;
import com.smartcampus.hub.dto.TicketUpdateDetailsRequest;
import com.smartcampus.hub.service.TicketService;
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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @GetMapping
    public List<TicketResponse> getAll() {
        return ticketService.findAll();
    }

    @GetMapping("/{id}")
    public TicketResponse getById(@PathVariable UUID id) {
        return ticketService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TicketResponse create(@Valid @RequestBody TicketCreateRequest request) {
        return ticketService.create(request);
    }

    @PutMapping("/{id}/details")
    public TicketResponse updateDetails(@PathVariable UUID id, @Valid @RequestBody TicketUpdateDetailsRequest request) {
        return ticketService.updateDetails(id, request);
    }

    @PutMapping("/{id}/assign")
    public TicketResponse assign(@PathVariable UUID id, @Valid @RequestBody TicketAssignRequest request) {
        return ticketService.assign(id, request);
    }

    @PutMapping("/{id}/start")
    public TicketResponse startWork(@PathVariable UUID id, @Valid @RequestBody TicketActionRequest request) {
        return ticketService.startWork(id, request);
    }

    @PutMapping("/{id}/resolve")
    public TicketResponse resolve(@PathVariable UUID id, @Valid @RequestBody TicketResolveRequest request) {
        return ticketService.resolve(id, request);
    }

    @PutMapping("/{id}/close")
    public TicketResponse close(@PathVariable UUID id, @Valid @RequestBody TicketActionRequest request) {
        return ticketService.close(id, request);
    }

    @PutMapping("/{id}/reject")
    public TicketResponse reject(@PathVariable UUID id, @Valid @RequestBody TicketRejectRequest request) {
        return ticketService.reject(id, request);
    }

    @PutMapping("/{id}/reopen")
    public TicketResponse reopen(@PathVariable UUID id, @Valid @RequestBody TicketActionRequest request) {
        return ticketService.reopen(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id, @RequestBody TicketActionRequest request) {
        ticketService.delete(id, request.actorUserId());
    }
}
