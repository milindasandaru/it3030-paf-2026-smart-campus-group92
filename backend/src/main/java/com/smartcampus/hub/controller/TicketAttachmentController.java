package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.AttachmentResponse;
import com.smartcampus.hub.entity.Attachment;
import com.smartcampus.hub.entity.Ticket;
import com.smartcampus.hub.entity.User;
import com.smartcampus.hub.exception.AccessDeniedException;
import com.smartcampus.hub.exception.BusinessException;
import com.smartcampus.hub.exception.NotFoundException;
import com.smartcampus.hub.repository.AttachmentRepository;
import com.smartcampus.hub.repository.TicketRepository;
import com.smartcampus.hub.repository.UserRepository;
import com.smartcampus.hub.util.Role;
import jakarta.validation.constraints.NotNull;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/tickets/{ticketId}/attachments")
@RequiredArgsConstructor
public class TicketAttachmentController {

    private static final int MAX_ATTACHMENTS_PER_TICKET = 3;
    private static final long MAX_FILE_SIZE_BYTES = 5L * 1024L * 1024L;

    private final AttachmentRepository attachmentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    @Value("${app.attachments.storage-dir:uploads}")
    private String storageDir;

    @GetMapping
    public List<AttachmentResponse> list(@PathVariable UUID ticketId) {
        getTicket(ticketId);
        return attachmentRepository.findByTicketIdOrderByCreatedAtDesc(ticketId).stream()
                .map(this::toResponse)
                .toList();
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public List<AttachmentResponse> upload(
            @PathVariable UUID ticketId,
            @RequestParam @NotNull UUID actorUserId,
            @RequestParam("files") List<MultipartFile> files)
            throws IOException {
        Ticket ticket = getTicket(ticketId);
        User actor = getUser(actorUserId);
        ensureCanManageAttachments(ticket, actor);

        if (files == null || files.isEmpty()) {
            throw new BusinessException("At least one image is required");
        }

        long existingCount = attachmentRepository.countByTicketId(ticketId);
        if (existingCount + files.size() > MAX_ATTACHMENTS_PER_TICKET) {
            throw new BusinessException("A ticket can contain up to 3 image attachments");
        }

        Path ticketDir = Paths.get(storageDir, "tickets", ticketId.toString());
        Files.createDirectories(ticketDir);

        for (MultipartFile file : files) {
            validateImage(file);
            String safeOriginalName = sanitizeFileName(file.getOriginalFilename());
            String storedName = UUID.randomUUID() + "-" + safeOriginalName;
            Path target = ticketDir.resolve(storedName).normalize();
            if (!target.startsWith(ticketDir)) {
                throw new BusinessException("Invalid attachment file path");
            }

            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            Attachment attachment = new Attachment();
            attachment.setFileName(safeOriginalName);
            attachment.setFileUrl(storedName);
            attachment.setTicket(ticket);
            attachment.setUploadedBy(actor);
            attachmentRepository.save(attachment);
        }

        return attachmentRepository.findByTicketIdOrderByCreatedAtDesc(ticketId).stream()
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/{attachmentId}/download")
    public ResponseEntity<Resource> download(@PathVariable UUID ticketId, @PathVariable UUID attachmentId) {
        Attachment attachment = getAttachment(ticketId, attachmentId);
        String storedName = parseStoredName(attachment.getFileUrl());
        Path filePath = Paths.get(storageDir, "tickets", ticketId.toString(), storedName).normalize();
        Resource resource = new FileSystemResource(filePath);
        if (!resource.exists()) {
            throw new NotFoundException("Attachment file not found");
        }

        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        try {
            String contentType = Files.probeContentType(filePath);
            if (contentType != null) {
                mediaType = MediaType.parseMediaType(contentType);
            }
        } catch (IOException ignored) {
            // Fall back to octet-stream
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.inline().filename(attachment.getFileName()).build().toString())
                .body(resource);
    }

    @DeleteMapping("/{attachmentId}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID ticketId,
            @PathVariable UUID attachmentId,
            @RequestParam @NotNull UUID actorUserId)
            throws IOException {
        Attachment attachment = getAttachment(ticketId, attachmentId);
        User actor = getUser(actorUserId);
        ensureCanDeleteAttachment(attachment, actor);

        String storedName = parseStoredName(attachment.getFileUrl());
        Path filePath = Paths.get(storageDir, "tickets", ticketId.toString(), storedName).normalize();
        Files.deleteIfExists(filePath);
        attachmentRepository.delete(attachment);
        return ResponseEntity.noContent().build();
    }

    private AttachmentResponse toResponse(Attachment attachment) {
        UUID ticketId = attachment.getTicket().getId();
        return new AttachmentResponse(
                attachment.getId(),
                attachment.getFileName(),
            "/api/tickets/" + ticketId + "/attachments/" + attachment.getId() + "/download",
                attachment.getUploadedBy().getId(),
                attachment.getUploadedBy().getFullName(),
                attachment.getCreatedAt());
    }

    private void ensureCanManageAttachments(Ticket ticket, User actor) {
        boolean reporter = ticket.getReporter().getId().equals(actor.getId());
        boolean privileged = actor.getRole() == Role.ADMIN || actor.getRole() == Role.TECHNICIAN;
        if (!reporter && !privileged) {
            throw new AccessDeniedException("Only ticket reporter, ADMIN, or TECHNICIAN can upload attachments");
        }
    }

    private void ensureCanDeleteAttachment(Attachment attachment, User actor) {
        boolean uploader = attachment.getUploadedBy().getId().equals(actor.getId());
        boolean reporter = attachment.getTicket().getReporter().getId().equals(actor.getId());
        boolean privileged = actor.getRole() == Role.ADMIN || actor.getRole() == Role.TECHNICIAN;
        if (!uploader && !reporter && !privileged) {
            throw new AccessDeniedException("Only uploader, ticket reporter, ADMIN, or TECHNICIAN can delete attachment");
        }
    }

    private void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Attachment file cannot be empty");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new BusinessException("Each attachment must be 5MB or less");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BusinessException("Only image attachments are allowed");
        }
    }

    private String sanitizeFileName(String original) {
        String fallback = "attachment";
        if (original == null || original.isBlank()) {
            return fallback;
        }
        String cleaned = original.replaceAll("[^a-zA-Z0-9._-]", "_");
        return cleaned.isBlank() ? fallback : cleaned;
    }

    private String parseStoredName(String fileUrl) {
        if (!fileUrl.contains("/")) {
            return fileUrl;
        }
        int lastSlash = fileUrl.lastIndexOf('/');
        if (lastSlash < 0 || lastSlash + 1 >= fileUrl.length()) {
            throw new NotFoundException("Invalid attachment location");
        }
        return fileUrl.substring(lastSlash + 1);
    }

    private Ticket getTicket(UUID id) {
        return ticketRepository.findById(id).orElseThrow(() -> new NotFoundException("Ticket not found: " + id));
    }

    private User getUser(UUID id) {
        return userRepository.findById(id).orElseThrow(() -> new NotFoundException("User not found: " + id));
    }

    private Attachment getAttachment(UUID ticketId, UUID attachmentId) {
        Attachment attachment = attachmentRepository
                .findById(attachmentId)
                .orElseThrow(() -> new NotFoundException("Attachment not found: " + attachmentId));
        if (attachment.getTicket() == null || !attachment.getTicket().getId().equals(ticketId)) {
            throw new NotFoundException("Attachment not found for ticket: " + ticketId);
        }
        return attachment;
    }
}