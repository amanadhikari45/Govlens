package com.govlens.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.Duration;

@Entity
@Table(name = "service_requests")
public class ServiceRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(nullable = false)
    private Integer priority = 3;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private Status status = Status.OPEN;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @Column(name = "submitted_by", length = 100)
    private String submittedBy;

    @Column(name = "assigned_to", length = 100)
    private String assignedTo;

    @Column(name = "submitted_at", nullable = false)
    private LocalDateTime submittedAt = LocalDateTime.now();

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "sla_deadline")
    private LocalDateTime slaDeadline;

    @Column(name = "resolution_notes", columnDefinition = "TEXT")
    private String resolutionNotes;

    public enum Status {
        OPEN, IN_PROGRESS, RESOLVED, CLOSED, ESCALATED
    }

    public ServiceRequest() {}

    public ServiceRequest(String title, String category, Department department) {
        this.title = title;
        this.category = category;
        this.department = department;
        this.submittedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public Integer getPriority() { return priority; }
    public void setPriority(Integer priority) {
        if (priority < 1 || priority > 5) throw new IllegalArgumentException("Priority must be 1-5");
        this.priority = priority;
    }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }
    public String getSubmittedBy() { return submittedBy; }
    public void setSubmittedBy(String submittedBy) { this.submittedBy = submittedBy; }
    public String getAssignedTo() { return assignedTo; }
    public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }
    public LocalDateTime getSlaDeadline() { return slaDeadline; }
    public void setSlaDeadline(LocalDateTime slaDeadline) { this.slaDeadline = slaDeadline; }
    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }

    public double calculatePriorityScore() {
        double base = this.priority * 20.0;
        long hoursOpen = Duration.between(submittedAt, LocalDateTime.now()).toHours();
        double ageFactor = Math.min(hoursOpen / 24.0, 30.0);
        double slaFactor = 0;
        if (slaDeadline != null && resolvedAt == null) {
            long hoursToSla = Duration.between(LocalDateTime.now(), slaDeadline).toHours();
            if (hoursToSla < 0) slaFactor = 40;
            else if (hoursToSla < 24) slaFactor = 25;
            else if (hoursToSla < 72) slaFactor = 10;
        }
        return base + ageFactor + slaFactor;
    }
}
