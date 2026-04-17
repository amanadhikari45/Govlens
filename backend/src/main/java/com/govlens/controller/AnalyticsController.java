package com.govlens.controller;

import com.govlens.dto.AnalyticsResponseDTO;
import com.govlens.dto.DepartmentMetricsDTO;
import com.govlens.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<AnalyticsResponseDTO> dashboard(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(analyticsService.getDashboardMetrics(days));
    }

    @GetMapping("/department/{id}")
    public ResponseEntity<DepartmentMetricsDTO> departmentMetrics(
            @PathVariable Long id,
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(analyticsService.getDepartmentAnalytics(id, days));
    }

    @GetMapping("/trends")
    public ResponseEntity<List<Map<String, Object>>> trends(
            @RequestParam Long departmentId,
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(analyticsService.getTrends(departmentId, days));
    }
}
