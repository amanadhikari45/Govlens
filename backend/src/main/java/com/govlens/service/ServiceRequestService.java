package com.govlens.service;

import com.govlens.dto.ServiceRequestDTO;
import com.govlens.exception.ResourceNotFoundException;
import com.govlens.model.AuditLog;
import com.govlens.model.Department;
import com.govlens.model.ServiceRequest;
import com.govlens.model.ServiceRequest.Status;
import com.govlens.repository.AuditLogRepository;
import com.govlens.repository.DepartmentRepository;
import com.govlens.repository.ServiceRequestRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class ServiceRequestService {

    private final ServiceRequestRepository requestRepo;
    private final DepartmentRepository departmentRepo;
    private final AuditLogRepository auditRepo;

    public ServiceRequestService(ServiceRequestRepository requestRepo,
                                 DepartmentRepository departmentRepo,
                                 AuditLogRepository auditRepo) {
        this.requestRepo = requestRepo;
        this.departmentRepo = departmentRepo;
        this.auditRepo = auditRepo;
    }

    public Page<ServiceRequestDTO> findAll(Status status, Long departmentId, Pageable pageable) {
        Page<ServiceRequest> page;
        if (status != null && departmentId != null) {
            page = requestRepo.findByStatusAndDepartmentId(status, departmentId, pageable);
        } else if (status != null) {
            page = requestRepo.findByStatus(status, pageable);
        } else if (departmentId != null) {
            page = requestRepo.findByDepartmentId(departmentId, pageable);
        } else {
            page = requestRepo.findAll(pageable);
        }
        return page.map(this::toDTO);
    }

    public ServiceRequestDTO findById(Long id) {
        return toDTO(requestRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceRequest", id)));
    }

    @Transactional
    public ServiceRequestDTO create(ServiceRequestDTO dto, String username) {
        if (dto.getDepartmentId() == null) {
            throw new IllegalArgumentException("departmentId is required");
        }
        Department dept = departmentRepo.findById(dto.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department", dto.getDepartmentId()));

        ServiceRequest sr = new ServiceRequest(dto.getTitle(), dto.getCategory(), dept);
        sr.setDescription(dto.getDescription());
        sr.setPriority(dto.getPriority() != null ? dto.getPriority() : 3);
        sr.setSubmittedBy(username);
        sr.setSlaDeadline(calculateSlaDeadline(sr.getPriority()));
        sr = requestRepo.save(sr);

        AuditLog log = AuditLog.create("SERVICE_REQUEST", sr.getId(), "CREATE", username);
        log.setNewValue("{\"title\":\"" + escapeJson(sr.getTitle()) + "\",\"priority\":" + sr.getPriority() + "}");
        auditRepo.save(log);

        return toDTO(sr);
    }

    @Transactional
    public ServiceRequestDTO updateStatus(Long id, Status newStatus, String assignedTo,
                                          String resolutionNotes, String username) {
        ServiceRequest sr = requestRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceRequest", id));

        String oldStatus = sr.getStatus().name();
        sr.setStatus(newStatus);
        if (assignedTo != null && !assignedTo.isBlank()) sr.setAssignedTo(assignedTo);
        if (resolutionNotes != null && !resolutionNotes.isBlank()) sr.setResolutionNotes(resolutionNotes);
        if (newStatus == Status.RESOLVED || newStatus == Status.CLOSED) {
            sr.setResolvedAt(LocalDateTime.now());
        }
        sr = requestRepo.save(sr);

        AuditLog log = AuditLog.create("SERVICE_REQUEST", sr.getId(), "STATUS_UPDATE", username);
        log.setOldValue("{\"status\":\"" + oldStatus + "\"}");
        log.setNewValue("{\"status\":\"" + newStatus.name() + "\"}");
        auditRepo.save(log);

        return toDTO(sr);
    }

    private LocalDateTime calculateSlaDeadline(int priority) {
        return switch (priority) {
            case 1 -> LocalDateTime.now().plusHours(4);
            case 2 -> LocalDateTime.now().plusHours(12);
            case 3 -> LocalDateTime.now().plusHours(48);
            case 4 -> LocalDateTime.now().plusDays(5);
            default -> LocalDateTime.now().plusDays(10);
        };
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private ServiceRequestDTO toDTO(ServiceRequest sr) {
        ServiceRequestDTO dto = new ServiceRequestDTO();
        dto.setId(sr.getId());
        dto.setTitle(sr.getTitle());
        dto.setDescription(sr.getDescription());
        dto.setCategory(sr.getCategory());
        dto.setPriority(sr.getPriority());
        dto.setStatus(sr.getStatus().name());
        if (sr.getDepartment() != null) {
            dto.setDepartmentId(sr.getDepartment().getId());
            dto.setDepartmentName(sr.getDepartment().getName());
        }
        dto.setSubmittedBy(sr.getSubmittedBy());
        dto.setAssignedTo(sr.getAssignedTo());
        dto.setSubmittedAt(sr.getSubmittedAt());
        dto.setResolvedAt(sr.getResolvedAt());
        dto.setSlaDeadline(sr.getSlaDeadline());
        dto.setResolutionNotes(sr.getResolutionNotes());
        dto.setPriorityScore(sr.calculatePriorityScore());
        return dto;
    }
}
