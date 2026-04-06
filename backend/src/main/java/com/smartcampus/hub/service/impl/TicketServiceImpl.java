package com.smartcampus.hub.service.impl;

import com.smartcampus.hub.dto.TicketRequest;
import com.smartcampus.hub.dto.TicketResponse;
import com.smartcampus.hub.entity.Resource;
import com.smartcampus.hub.entity.Ticket;
import com.smartcampus.hub.entity.User;
import com.smartcampus.hub.exception.NotFoundException;
import com.smartcampus.hub.mapper.TicketMapper;
import com.smartcampus.hub.repository.ResourceRepository;
import com.smartcampus.hub.repository.TicketRepository;
import com.smartcampus.hub.repository.UserRepository;
import com.smartcampus.hub.service.TicketService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final TicketMapper ticketMapper;

    @Override
    @Transactional(readOnly = true)
    public List<TicketResponse> findAll() {
        return ticketRepository.findAll().stream().map(ticketMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TicketResponse findById(UUID id) {
        return ticketMapper.toResponse(getTicket(id));
    }

    @Override
    public TicketResponse create(TicketRequest request) {
        Ticket ticket = new Ticket();
        applyRequest(ticket, request);
        return ticketMapper.toResponse(ticketRepository.save(ticket));
    }

    @Override
    public TicketResponse update(UUID id, TicketRequest request) {
        Ticket ticket = getTicket(id);
        applyRequest(ticket, request);
        return ticketMapper.toResponse(ticketRepository.save(ticket));
    }

    @Override
    public void delete(UUID id) {
        ticketRepository.delete(getTicket(id));
    }

    private void applyRequest(Ticket ticket, TicketRequest request) {
        User reporter = userRepository
                .findById(request.reporterId())
                .orElseThrow(() -> new NotFoundException("Reporter not found: " + request.reporterId()));
        User assignee = request.assigneeId() == null
                ? null
                : userRepository
                        .findById(request.assigneeId())
                        .orElseThrow(() -> new NotFoundException("Assignee not found: " + request.assigneeId()));
        Resource resource = request.resourceId() == null
                ? null
                : resourceRepository
                        .findById(request.resourceId())
                        .orElseThrow(() -> new NotFoundException("Resource not found: " + request.resourceId()));

        ticket.setTitle(request.title());
        ticket.setDescription(request.description());
        ticket.setPriority(request.priority());
        ticket.setStatus(request.status());
        ticket.setReporter(reporter);
        ticket.setAssignee(assignee);
        ticket.setResource(resource);
    }

    private Ticket getTicket(UUID id) {
        return ticketRepository.findById(id).orElseThrow(() -> new NotFoundException("Ticket not found: " + id));
    }
}
