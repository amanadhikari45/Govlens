package com.govlens.service;

import com.govlens.dto.AnalyticsResponseDTO;
import com.govlens.dto.DepartmentMetricsDTO;
import com.govlens.model.Department;
import com.govlens.model.ServiceRequest.Status;
import com.govlens.repository.DepartmentRepository;
import com.govlens.repository.ServiceRequestRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final ServiceRequestRepository requestRepo;
    private final DepartmentRepository departmentRepo;

    public AnalyticsService(ServiceRequestRepository requestRepo,
                            DepartmentRepository departmentRepo) {
        this.requestRepo = requestRepo;
        this.departmentRepo = departmentRepo;
    }

    /**
     * Builds the full dashboard payload: global KPIs + per-department metrics.
     * Designed to return in under 100ms by leveraging indexed queries.
     */
    public AnalyticsResponseDTO getDashboardMetrics(int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        List<Department> departments = departmentRepo.findAll();

        List<DepartmentMetricsDTO> deptMetrics = departments.stream()
                .map(dept -> buildDepartmentMetrics(dept, startDate))
                .collect(Collectors.toList());

        AnalyticsResponseDTO response = new AnalyticsResponseDTO();
        response.setDepartmentMetrics(deptMetrics);

        // Aggregate global KPIs from department-level data
        response.setTotalOpenRequests(
                requestRepo.countByStatusIn(List.of(Status.OPEN, Status.IN_PROGRESS)));
        response.setTotalResolvedRequests(
                requestRepo.countByStatusIn(List.of(Status.RESOLVED, Status.CLOSED)));

        double avgResolution = deptMetrics.stream()
                .filter(m -> m.getAvgResolutionHours() > 0)
                .mapToDouble(DepartmentMetricsDTO::getAvgResolutionHours)
                .average()
                .orElse(0.0);
        response.setOverallAvgResolutionHours(Math.round(avgResolution * 10.0) / 10.0);

        double avgSla = deptMetrics.stream()
                .filter(m -> m.getSlaCompliancePct() > 0)
                .mapToDouble(DepartmentMetricsDTO::getSlaCompliancePct)
                .average()
                .orElse(100.0);
        response.setOverallSlaCompliancePct(Math.round(avgSla * 10.0) / 10.0);

        return response;
    }

    /**
     * Department-specific metrics with status breakdown and trend data.
     */
    public DepartmentMetricsDTO getDepartmentAnalytics(Long departmentId, int days) {
        Department dept = departmentRepo.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Department not found: " + departmentId));
        return buildDepartmentMetrics(dept, LocalDateTime.now().minusDays(days));
    }

    /**
     * Daily volume trends for a department — feeds the line chart on the frontend.
     */
    public List<Map<String, Object>> getTrends(Long departmentId, int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        List<Object[]> raw = requestRepo.dailyVolume(departmentId, startDate);

        return raw.stream().map(row -> {
            Map<String, Object> point = new LinkedHashMap<>();
            point.put("date", row[0].toString());
            point.put("count", ((Number) row[1]).longValue());
            return point;
        }).collect(Collectors.toList());
    }

    private DepartmentMetricsDTO buildDepartmentMetrics(Department dept, LocalDateTime startDate) {
        DepartmentMetricsDTO dto = new DepartmentMetricsDTO();
        dto.setDepartmentId(dept.getId());
        dto.setDepartmentName(dept.getName());

        // Status breakdown
        List<Object[]> statusCounts = requestRepo.countByStatusForDepartment(dept.getId());
        Map<String, Long> breakdown = new HashMap<>();
        long total = 0, open = 0, resolved = 0;
        for (Object[] row : statusCounts) {
            String status = ((Status) row[0]).name();
            long count = (Long) row[1];
            breakdown.put(status, count);
            total += count;
            if (status.equals("OPEN") || status.equals("IN_PROGRESS")) open += count;
            if (status.equals("RESOLVED") || status.equals("CLOSED")) resolved += count;
        }

        dto.setTotalRequests(total);
        dto.setOpenRequests(open);
        dto.setResolvedRequests(resolved);
        dto.setStatusBreakdown(breakdown);

        // Performance metrics
        Double avgHours = requestRepo.avgResolutionHours(dept.getId(), startDate);
        dto.setAvgResolutionHours(avgHours != null ? Math.round(avgHours * 10.0) / 10.0 : 0.0);

        Double slaRate = requestRepo.slaComplianceRate(dept.getId(), startDate);
        dto.setSlaCompliancePct(slaRate != null ? Math.round(slaRate * 10.0) / 10.0 : 100.0);

        // Backlog depth
        long backlog = requestRepo.findBacklogOlderThan(LocalDateTime.now().minusDays(7))
                .stream()
                .filter(sr -> sr.getDepartment().getId().equals(dept.getId()))
                .count();
        dto.setBacklogOver7Days(backlog);

        return dto;
    }
}
