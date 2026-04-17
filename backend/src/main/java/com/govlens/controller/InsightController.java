package com.govlens.controller;

import com.govlens.service.InsightService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/insights")
public class InsightController {

    private final InsightService insightService;

    public InsightController(InsightService insightService) {
        this.insightService = insightService;
    }

    @PostMapping("/generate")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> generate(@RequestParam Long departmentId) {
        return ResponseEntity.ok(insightService.generateInsight(departmentId));
    }

    @GetMapping("/latest")
    public ResponseEntity<List<Map<String, Object>>> latest() {
        return ResponseEntity.ok(insightService.getLatestInsights());
    }
}
