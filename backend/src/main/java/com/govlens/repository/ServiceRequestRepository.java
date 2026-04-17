package com.govlens.repository;

import com.govlens.model.ServiceRequest;
import com.govlens.model.ServiceRequest.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {

    Page<ServiceRequest> findByStatus(Status status, Pageable pageable);
    Page<ServiceRequest> findByDepartmentId(Long departmentId, Pageable pageable);
    Page<ServiceRequest> findByStatusAndDepartmentId(Status status, Long departmentId, Pageable pageable);

    @Query("SELECT sr FROM ServiceRequest sr WHERE sr.category = :category " +
           "AND sr.status <> 'CLOSED' AND sr.status <> 'RESOLVED' " +
           "ORDER BY sr.priority ASC, sr.submittedAt ASC")
    List<ServiceRequest> findActiveByCategory(@Param("category") String category);

    @Query("SELECT sr.status, COUNT(sr) FROM ServiceRequest sr " +
           "WHERE sr.department.id = :deptId GROUP BY sr.status")
    List<Object[]> countByStatusForDepartment(@Param("deptId") Long departmentId);

    @Query(value = "SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (resolved_at - submitted_at)) / 3600), 0) " +
                   "FROM service_requests " +
                   "WHERE department_id = :deptId AND resolved_at IS NOT NULL AND submitted_at >= :startDate",
           nativeQuery = true)
    Double avgResolutionHours(@Param("deptId") Long departmentId, @Param("startDate") LocalDateTime startDate);

    @Query(value = "SELECT CASE WHEN COUNT(*) = 0 THEN 100.0 " +
                   "ELSE CAST(COUNT(*) FILTER (WHERE resolved_at <= sla_deadline) AS float) / COUNT(*) * 100.0 END " +
                   "FROM service_requests " +
                   "WHERE department_id = :deptId AND resolved_at IS NOT NULL " +
                   "AND sla_deadline IS NOT NULL AND submitted_at >= :startDate",
           nativeQuery = true)
    Double slaComplianceRate(@Param("deptId") Long departmentId, @Param("startDate") LocalDateTime startDate);

    @Query(value = "SELECT DATE(submitted_at) AS request_date, COUNT(*) AS request_count " +
                   "FROM service_requests " +
                   "WHERE department_id = :deptId AND submitted_at >= :startDate " +
                   "GROUP BY DATE(submitted_at) ORDER BY request_date",
           nativeQuery = true)
    List<Object[]> dailyVolume(@Param("deptId") Long departmentId, @Param("startDate") LocalDateTime startDate);

    // FIX: Hibernate 6 does NOT support fully-qualified enum class paths in JPQL.
    // Use native SQL with string literals instead — the column is VARCHAR, not an enum type in the DB.
    @Query(value = "SELECT * FROM service_requests " +
                   "WHERE status IN ('OPEN', 'IN_PROGRESS') " +
                   "AND submitted_at < :cutoff " +
                   "ORDER BY priority ASC, submitted_at ASC",
           nativeQuery = true)
    List<ServiceRequest> findBacklogOlderThan(@Param("cutoff") LocalDateTime cutoff);

    long countByStatusIn(List<Status> statuses);
}
