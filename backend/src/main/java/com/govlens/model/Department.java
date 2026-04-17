package com.govlens.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "departments")
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 10)
    private String code;

    @Column(name = "budget_fy", precision = 15, scale = 2)
    private BigDecimal budgetFy;

    @Column
    private Integer headcount;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @JsonIgnore
    @OneToMany(mappedBy = "department", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ServiceRequest> serviceRequests = new ArrayList<>();

    public Department() {}

    public Department(String name, String code) {
        this.name = name;
        this.code = code;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public BigDecimal getBudgetFy() { return budgetFy; }
    public void setBudgetFy(BigDecimal budgetFy) { this.budgetFy = budgetFy; }
    public Integer getHeadcount() { return headcount; }
    public void setHeadcount(Integer headcount) { this.headcount = headcount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public List<ServiceRequest> getServiceRequests() { return serviceRequests; }
}
