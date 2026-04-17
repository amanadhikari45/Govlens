package com.govlens.controller;

import com.govlens.dto.ServiceRequestDTO;
import com.govlens.model.ServiceRequest.Status;
import com.govlens.service.ServiceRequestService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/requests")
public class ServiceRequestController {

    private final ServiceRequestService service;

    public ServiceRequestController(ServiceRequestService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<Page<ServiceRequestDTO>> list(
            @RequestParam(required = false) Status status,
            @RequestParam(required = false) Long departmentId,
            @PageableDefault(size = 20, sort = "submittedAt") Pageable pageable) {
        return ResponseEntity.ok(service.findAll(status, departmentId, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceRequestDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<ServiceRequestDTO> create(
            @RequestBody ServiceRequestDTO dto,
            Authentication authentication) {
        // FIX: use Authentication.getName() instead of @AuthenticationPrincipal String
        String username = authentication != null ? authentication.getName() : "system";
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.create(dto, username));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<ServiceRequestDTO> updateStatus(
            @PathVariable Long id,
            @RequestParam Status status,
            @RequestParam(required = false) String assignedTo,
            @RequestParam(required = false) String resolutionNotes,
            Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "system";
        return ResponseEntity.ok(
                service.updateStatus(id, status, assignedTo, resolutionNotes, username));
    }
}
