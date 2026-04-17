package com.govlens.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_insight_cache")
public class InsightCache {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "insight_type", nullable = false, length = 50)
    private String insightType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    // FIX: DB schema defines this as jsonb, must match
    @Column(name = "data_snapshot", columnDefinition = "jsonb")
    private String dataSnapshot;

    @Column(name = "generated_at")
    private LocalDateTime generatedAt = LocalDateTime.now();

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    public InsightCache() {}

    public static InsightCache of(String type, Department dept, String content, int ttlHours) {
        InsightCache cache = new InsightCache();
        cache.insightType = type;
        cache.department = dept;
        cache.content = content;
        cache.generatedAt = LocalDateTime.now();
        cache.expiresAt = LocalDateTime.now().plusHours(ttlHours);
        return cache;
    }

    public boolean isExpired() {
        return expiresAt != null && LocalDateTime.now().isAfter(expiresAt);
    }

    public Long getId() { return id; }
    public String getInsightType() { return insightType; }
    public Department getDepartment() { return department; }
    public String getContent() { return content; }
    public String getDataSnapshot() { return dataSnapshot; }
    public void setDataSnapshot(String dataSnapshot) { this.dataSnapshot = dataSnapshot; }
    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
}
