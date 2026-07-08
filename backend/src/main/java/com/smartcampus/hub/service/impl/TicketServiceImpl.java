package com.smartcampus.hub.service.impl;

import com.smartcampus.hub.dto.TicketActionRequest;
import com.smartcampus.hub.dto.TicketAssignRequest;
import com.smartcampus.hub.dto.TicketCreateRequest;
import com.smartcampus.hub.dto.TicketRejectRequest;
import com.smartcampus.hub.dto.TicketResolveRequest;
import com.smartcampus.hub.dto.TicketResponse;
import com.smartcampus.hub.dto.TicketUpdateDetailsRequest;
import com.smartcampus.hub.entity.Resource;
import com.smartcampus.hub.entity.Ticket;
import com.smartcampus.hub.entity.User;
import com.smartcampus.hub.exception.AccessDeniedException;
import com.smartcampus.hub.exception.BusinessException;
import com.smartcampus.hub.exception.NotFoundException;
import com.smartcampus.hub.mapper.TicketMapper;
import com.smartcampus.hub.repository.ResourceRepository;
import com.smartcampus.hub.repository.TicketRepository;
import com.smartcampus.hub.repository.UserRepository;
import com.smartcampus.hub.service.NotificationService;
import com.smartcampus.hub.service.TicketService;
import com.smartcampus.hub.util.NotificationType;
import com.smartcampus.hub.util.Role;
import com.smartcampus.hub.util.TicketStatus;
import java.time.OffsetDateTime;
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
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final NotificationService notificationService;
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
    public TicketResponse create(TicketCreateRequest request) {
        User reporter = getUser(request.reporterId());
        Resource resource = getResourceOrNull(request.resourceId());

        Ticket ticket = new Ticket();
        ticket.setTitle(request.title());
        ticket.setDescription(request.description());
        ticket.setCategory(request.category());
        ticket.setContactDetails(request.contactDetails());
        ticket.setPriority(request.priority());
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setResolutionNotes(null);
        ticket.setFirstResponseAt(null);
        ticket.setResolvedAt(null);
        ticket.setReporter(reporter);
        ticket.setResource(resource);
        ticket.setAssignee(null);

        Ticket saved = ticketRepository.save(ticket);
        notifyPrivilegedUsers(
                "New ticket created: " + saved.getTitle(), NotificationType.TICKET_CREATED, saved.getReporter().getId());
        return ticketMapper.toResponse(saved);
    }

    @Override
    public TicketResponse updateDetails(UUID id, TicketUpdateDetailsRequest request) {
        Ticket ticket = getTicket(id);
        User actor = getUser(request.actorUserId());
        boolean canEdit = ticket.getReporter().getId().equals(actor.getId()) || isPrivileged(actor.getRole());
        if (!canEdit) {
            throw new AccessDeniedException("Only ticket reporter or ADMIN/TECHNICIAN can update ticket details");
        }
        if (ticket.getStatus() != TicketStatus.OPEN) {
            throw new BusinessException("Ticket details can only be updated while status is OPEN");
        }

        ticket.setTitle(request.title());
        ticket.setDescription(request.description());
        ticket.setCategory(request.category());
        ticket.setContactDetails(request.contactDetails());
        ticket.setPriority(request.priority());
        ticket.setResource(getResourceOrNull(request.resourceId()));

        return ticketMapper.toResponse(ticketRepository.save(ticket));
    }

    @Override
    public TicketResponse assign(UUID id, TicketAssignRequest request) {
        Ticket ticket = getTicket(id);
        User actor = getUser(request.actorUserId());
        User assignee = getUser(request.assigneeId());
        if (!isPrivileged(actor.getRole())) {
            throw new AccessDeniedException("Only ADMIN/TECHNICIAN can assign tickets");
        }
        if (assignee.getRole() != Role.TECHNICIAN) {
            throw new BusinessException("Assignee must be TECHNICIAN");
        }
        if (ticket.getStatus() != TicketStatus.OPEN) {
            throw new BusinessException("Ticket can only be assigned while OPEN");
        }

        ticket.setAssignee(assignee);
        Ticket saved = ticketRepository.save(ticket);
        notifyUsers(
                Set.of(saved.getReporter().getId(), assignee.getId()),
                "Ticket assigned: " + saved.getTitle(),
                NotificationType.TICKET_ASSIGNED,
                actor.getId());
        return ticketMapper.toResponse(saved);
    }

    @Override
    public TicketResponse startWork(UUID id, TicketActionRequest request) {
        Ticket ticket = getTicket(id);
        User actor = getUser(request.actorUserId());
        ensureStatus(ticket, TicketStatus.OPEN, "Only OPEN tickets can be moved to IN_PROGRESS");
        if (ticket.getAssignee() == null) {
            throw new BusinessException("Ticket must be assigned before work can start");
        }
        if (actor.getRole() != Role.TECHNICIAN) {
            throw new AccessDeniedException("Only TECHNICIAN assignee can start ticket work");
        }
        boolean isActorAssignee = ticket.getAssignee().getId().equals(actor.getId());
        if (!isActorAssignee) {
            throw new AccessDeniedException("Only TECHNICIAN assignee can start ticket work");
        }

        ticket.setStatus(TicketStatus.IN_PROGRESS);
        if (ticket.getFirstResponseAt() == null) {
            ticket.setFirstResponseAt(OffsetDateTime.now());
        }
        Ticket saved = ticketRepository.save(ticket);
        notifyUsers(
                Set.of(saved.getReporter().getId(), saved.getAssignee().getId()),
                "Ticket is now IN_PROGRESS: " + saved.getTitle(),
                NotificationType.TICKET_IN_PROGRESS,
                actor.getId());
        return ticketMapper.toResponse(saved);
    }

    @Override
    public TicketResponse resolve(UUID id, TicketResolveRequest request) {
        Ticket ticket = getTicket(id);
        User actor = getUser(request.actorUserId());
        ensureStatus(ticket, TicketStatus.IN_PROGRESS, "Only IN_PROGRESS tickets can be resolved");
        if (request.resolutionNotes() == null || request.resolutionNotes().isBlank()) {
            throw new BusinessException("Resolution notes are required when resolving a ticket");
        }

        if (actor.getRole() != Role.TECHNICIAN) {
            throw new AccessDeniedException("Only TECHNICIAN assignee can resolve ticket");
        }
        boolean isActorAssignee = ticket.getAssignee() != null && ticket.getAssignee().getId().equals(actor.getId());
        if (!isActorAssignee) {
            throw new AccessDeniedException("Only TECHNICIAN assignee can resolve ticket");
        }

        ticket.setStatus(TicketStatus.RESOLVED);
        ticket.setResolutionNotes(request.resolutionNotes());
        ticket.setResolvedAt(OffsetDateTime.now());
        Ticket saved = ticketRepository.save(ticket);
        notifyUsers(
                Set.of(saved.getReporter().getId()),
                "Ticket resolved: " + saved.getTitle(),
                NotificationType.TICKET_RESOLVED,
                actor.getId());
        return ticketMapper.toResponse(saved);
    }

    @Override
    public TicketResponse close(UUID id, TicketActionRequest request) {
        Ticket ticket = getTicket(id);
        User actor = getUser(request.actorUserId());
        ensureStatus(ticket, TicketStatus.RESOLVED, "Only RESOLVED tickets can be closed");

        boolean isReporter = ticket.getReporter().getId().equals(actor.getId());
        if (!isReporter) {
            throw new AccessDeniedException("Only reporter can close ticket");
        }

        ticket.setStatus(TicketStatus.CLOSED);
        Ticket saved = ticketRepository.save(ticket);
        notifyUsers(
                assigneeAndReporter(saved),
                "Ticket closed: " + saved.getTitle(),
                NotificationType.TICKET_CLOSED,
                actor.getId());
        return ticketMapper.toResponse(saved);
    }

    @Override
    public TicketResponse reject(UUID id, TicketRejectRequest request) {
        Ticket ticket = getTicket(id);
        User actor = getUser(request.actorUserId());
        if (actor.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only ADMIN can reject ticket");
        }
        if (ticket.getStatus() != TicketStatus.OPEN) {
            throw new BusinessException("Only OPEN tickets can be rejected");
        }
        if (request.rejectionReason() == null || request.rejectionReason().isBlank()) {
            throw new BusinessException("Rejection reason is required");
        }

        ticket.setStatus(TicketStatus.REJECTED);
        ticket.setResolutionNotes(request.rejectionReason());
        ticket.setResolvedAt(null);
        Ticket saved = ticketRepository.save(ticket);
        notifyUsers(
                assigneeAndReporter(saved),
                "Ticket rejected: " + saved.getTitle(),
                NotificationType.TICKET_REJECTED,
                actor.getId());
        return ticketMapper.toResponse(saved);
    }

    @Override
    public TicketResponse reopen(UUID id, TicketActionRequest request) {
        Ticket ticket = getTicket(id);
        User actor = getUser(request.actorUserId());
        if (ticket.getStatus() != TicketStatus.CLOSED && ticket.getStatus() != TicketStatus.REJECTED) {
            throw new BusinessException("Only CLOSED or REJECTED tickets can be reopened");
        }

        boolean isReporter = ticket.getReporter().getId().equals(actor.getId());
        if (!isReporter && !isPrivileged(actor.getRole())) {
            throw new AccessDeniedException("Only reporter or ADMIN/TECHNICIAN can reopen ticket");
        }

        ticket.setStatus(TicketStatus.OPEN);
        ticket.setResolutionNotes(null);
        ticket.setResolvedAt(null);
        Ticket saved = ticketRepository.save(ticket);
        notifyUsers(
                assigneeAndReporter(saved),
                "Ticket reopened: " + saved.getTitle(),
            NotificationType.TICKET_CREATED,
                actor.getId());
        notifyPrivilegedUsers(
                "Reopened ticket requires triage: " + saved.getTitle(),
            NotificationType.TICKET_CREATED,
                actor.getId());
        return ticketMapper.toResponse(saved);
    }

    @Override
    public void delete(UUID id, UUID actorUserId) {
        User actor = getUser(actorUserId);
        if (actor.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only ADMIN can delete tickets");
        }
        ticketRepository.delete(getTicket(id));
    }

    private void ensureStatus(Ticket ticket, TicketStatus expected, String message) {
        if (ticket.getStatus() != expected) {
            throw new BusinessException(message);
        }
    }

    private boolean isPrivileged(Role role) {
        return role == Role.ADMIN || role == Role.TECHNICIAN;
    }

    private Set<UUID> assigneeAndReporter(Ticket ticket) {
        Set<UUID> ids = new LinkedHashSet<>();
        ids.add(ticket.getReporter().getId());
        if (ticket.getAssignee() != null) {
            ids.add(ticket.getAssignee().getId());
        }
        return ids;
    }

    private void notifyPrivilegedUsers(String message, NotificationType type, UUID actorId) {
        Set<UUID> ids = new LinkedHashSet<>();
        userRepository.findByRole(Role.ADMIN).forEach(user -> ids.add(user.getId()));
        userRepository.findByRole(Role.TECHNICIAN).forEach(user -> ids.add(user.getId()));
        notifyUsers(ids, message, type, actorId);
    }

    private void notifyUsers(Set<UUID> recipientIds, String message, NotificationType type, UUID actorId) {
        for (UUID recipientId : recipientIds) {
            if (recipientId.equals(actorId)) {
                continue;
            }
            notificationService.createNotification(recipientId, message, type);
        }
    }

    private User getUser(UUID id) {
        return userRepository.findById(id).orElseThrow(() -> new NotFoundException("User not found: " + id));
    }

    private Resource getResourceOrNull(Long id) {
        if (id == null) {
            return null;
        }
        return resourceRepository.findById(id).orElseThrow(() -> new NotFoundException("Resource not found: " + id));
    }

    private Ticket getTicket(UUID id) {
        return ticketRepository.findById(id).orElseThrow(() -> new NotFoundException("Ticket not found: " + id));
    }
}
