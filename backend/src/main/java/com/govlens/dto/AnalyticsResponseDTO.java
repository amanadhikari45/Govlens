package com.govlens.dto;

import java.util.List;
import java.util.Map;

public class AnalyticsResponseDTO {

    private long totalOpenRequests;
    private long totalResolvedRequests;
    private double overallAvgResolutionHours;
    private double overallSlaCompliancePct;
    private List<DepartmentMetricsDTO> departmentMetrics;
    private List<Map<String, Object>> dailyTrends;

    public AnalyticsResponseDTO() {}

    public long getTotalOpenRequests() { return totalOpenRequests; }
    public void setTotalOpenRequests(long totalOpenRequests) { this.totalOpenRequests = totalOpenRequests; }
    public long getTotalResolvedRequests() { return totalResolvedRequests; }
    public void setTotalResolvedRequests(long totalResolvedRequests) { this.totalResolvedRequests = totalResolvedRequests; }
    public double getOverallAvgResolutionHours() { return overallAvgResolutionHours; }
    public void setOverallAvgResolutionHours(double overallAvgResolutionHours) { this.overallAvgResolutionHours = overallAvgResolutionHours; }
    public double getOverallSlaCompliancePct() { return overallSlaCompliancePct; }
    public void setOverallSlaCompliancePct(double overallSlaCompliancePct) { this.overallSlaCompliancePct = overallSlaCompliancePct; }
    public List<DepartmentMetricsDTO> getDepartmentMetrics() { return departmentMetrics; }
    public void setDepartmentMetrics(List<DepartmentMetricsDTO> departmentMetrics) { this.departmentMetrics = departmentMetrics; }
    public List<Map<String, Object>> getDailyTrends() { return dailyTrends; }
    public void setDailyTrends(List<Map<String, Object>> dailyTrends) { this.dailyTrends = dailyTrends; }
}
