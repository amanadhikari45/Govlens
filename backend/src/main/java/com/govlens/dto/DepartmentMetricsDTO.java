package com.govlens.dto;

import java.util.Map;

public class DepartmentMetricsDTO {

    private Long departmentId;
    private String departmentName;
    private long totalRequests;
    private long openRequests;
    private long resolvedRequests;
    private double avgResolutionHours;
    private double slaCompliancePct;
    private long backlogOver7Days;
    private Map<String, Long> statusBreakdown;

    public DepartmentMetricsDTO() {}

    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }
    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }
    public long getTotalRequests() { return totalRequests; }
    public void setTotalRequests(long totalRequests) { this.totalRequests = totalRequests; }
    public long getOpenRequests() { return openRequests; }
    public void setOpenRequests(long openRequests) { this.openRequests = openRequests; }
    public long getResolvedRequests() { return resolvedRequests; }
    public void setResolvedRequests(long resolvedRequests) { this.resolvedRequests = resolvedRequests; }
    public double getAvgResolutionHours() { return avgResolutionHours; }
    public void setAvgResolutionHours(double avgResolutionHours) { this.avgResolutionHours = avgResolutionHours; }
    public double getSlaCompliancePct() { return slaCompliancePct; }
    public void setSlaCompliancePct(double slaCompliancePct) { this.slaCompliancePct = slaCompliancePct; }
    public long getBacklogOver7Days() { return backlogOver7Days; }
    public void setBacklogOver7Days(long backlogOver7Days) { this.backlogOver7Days = backlogOver7Days; }
    public Map<String, Long> getStatusBreakdown() { return statusBreakdown; }
    public void setStatusBreakdown(Map<String, Long> statusBreakdown) { this.statusBreakdown = statusBreakdown; }
}
