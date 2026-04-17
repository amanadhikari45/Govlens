package com.govlens.service;

import com.govlens.model.AuditLog;
import com.govlens.repository.AuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class AuditService {

    private final AuditLogRepository auditRepo;

    public AuditService(AuditLogRepository auditRepo) {
        this.auditRepo = auditRepo;
    }

    public Page<AuditLog> getByEntityType(String entityType, Pageable pageable) {
        return auditRepo.findByEntityType(entityType, pageable);
    }

    public Page<AuditLog> getByEntity(String entityType, Long entityId, Pageable pageable) {
        return auditRepo.findByEntityTypeAndEntityId(entityType, entityId, pageable);
    }

    public Page<AuditLog> getByUser(String username, Pageable pageable) {
        return auditRepo.findByPerformedBy(username, pageable);
    }
}
