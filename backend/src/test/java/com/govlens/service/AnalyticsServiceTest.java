package com.govlens.service;

import com.govlens.dto.AnalyticsResponseDTO;
import com.govlens.dto.DepartmentMetricsDTO;
import com.govlens.model.Department;
import com.govlens.model.ServiceRequest.Status;
import com.govlens.repository.DepartmentRepository;
import com.govlens.repository.ServiceRequestRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    @Mock
    private ServiceRequestRepository requestRepo;

    @Mock
    private DepartmentRepository departmentRepo;

    @InjectMocks
    private AnalyticsService analyticsService;

    private Department testDept;

    @BeforeEach
    void setUp() {
        testDept = new Department("Public Works", "PW");
        // Use reflection or a test builder to set the ID in real tests
    }

    @Test
    @DisplayName("Dashboard metrics aggregates across all departments")
    void getDashboardMetrics_returnsSummary() {
        when(departmentRepo.findAll()).thenReturn(List.of(testDept));
        when(requestRepo.countByStatusForDepartment(any())).thenReturn(List.of(
                new Object[]{Status.OPEN, 25L},
                new Object[]{Status.RESOLVED, 150L}
        ));
        when(requestRepo.avgResolutionHours(any(), any(LocalDateTime.class))).thenReturn(36.5);
        when(requestRepo.slaComplianceRate(any(), any(LocalDateTime.class))).thenReturn(87.3);
        when(requestRepo.countByStatusIn(List.of(Status.OPEN, Status.IN_PROGRESS))).thenReturn(45L);
        when(requestRepo.countByStatusIn(List.of(Status.RESOLVED, Status.CLOSED))).thenReturn(350L);
        when(requestRepo.findBacklogOlderThan(any())).thenReturn(Collections.emptyList());

        AnalyticsResponseDTO result = analyticsService.getDashboardMetrics(30);

        assertThat(result.getTotalOpenRequests()).isEqualTo(45L);
        assertThat(result.getTotalResolvedRequests()).isEqualTo(350L);
        assertThat(result.getDepartmentMetrics()).hasSize(1);
    }

    @Test
    @DisplayName("Department analytics computes SLA compliance correctly")
    void getDepartmentAnalytics_computesSla() {
        when(departmentRepo.findById(1L)).thenReturn(Optional.of(testDept));
        when(requestRepo.countByStatusForDepartment(any())).thenReturn(List.of(
                new Object[]{Status.OPEN, 10L},
                new Object[]{Status.RESOLVED, 90L}
        ));
        when(requestRepo.avgResolutionHours(any(), any())).thenReturn(24.0);
        when(requestRepo.slaComplianceRate(any(), any())).thenReturn(92.5);
        when(requestRepo.findBacklogOlderThan(any())).thenReturn(Collections.emptyList());

        DepartmentMetricsDTO result = analyticsService.getDepartmentAnalytics(1L, 30);

        assertThat(result.getSlaCompliancePct()).isEqualTo(92.5);
        assertThat(result.getAvgResolutionHours()).isEqualTo(24.0);
        assertThat(result.getOpenRequests()).isEqualTo(10L);
    }

    @Test
    @DisplayName("Trends returns daily volume data points")
    void getTrends_returnsDailyData() {
        when(requestRepo.dailyVolume(eq(1L), any())).thenReturn(List.of(
                new Object[]{"2025-01-15", 12L},
                new Object[]{"2025-01-16", 8L},
                new Object[]{"2025-01-17", 15L}
        ));

        var trends = analyticsService.getTrends(1L, 30);

        assertThat(trends).hasSize(3);
        assertThat(trends.get(0).get("date")).isEqualTo("2025-01-15");
        assertThat(trends.get(0).get("count")).isEqualTo(12L);
    }
}
