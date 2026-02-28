package com.insurai.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "policies")
public class Policy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "policy_number", nullable = false, unique = true)
    private String policyNumber;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PolicyType type;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal coverage;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal premium;

    @Enumerated(EnumType.STRING)
    private PolicyStatus status = PolicyStatus.PENDING;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Policy() {}

    public Long getId()                 { return id; }
    public User getUser()               { return user; }
    public String getPolicyNumber()     { return policyNumber; }
    public String getName()             { return name; }
    public PolicyType getType()         { return type; }
    public BigDecimal getCoverage()     { return coverage; }
    public BigDecimal getPremium()      { return premium; }
    public PolicyStatus getStatus()     { return status; }
    public LocalDate getStartDate()     { return startDate; }
    public LocalDate getExpiryDate()    { return expiryDate; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public void setId(Long v)               { this.id = v; }
    public void setUser(User v)             { this.user = v; }
    public void setPolicyNumber(String v)   { this.policyNumber = v; }
    public void setName(String v)           { this.name = v; }
    public void setType(PolicyType v)       { this.type = v; }
    public void setCoverage(BigDecimal v)   { this.coverage = v; }
    public void setPremium(BigDecimal v)    { this.premium = v; }
    public void setStatus(PolicyStatus v)   { this.status = v; }
    public void setStartDate(LocalDate v)   { this.startDate = v; }
    public void setExpiryDate(LocalDate v)  { this.expiryDate = v; }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (policyNumber == null) policyNumber = "POL-" + System.currentTimeMillis();
    }

    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    public enum PolicyType   { HEALTH, AUTO, HOME, LIFE, TRAVEL, BUSINESS }
    public enum PolicyStatus { PENDING, UNDER_REVIEW, ACTIVE, REJECTED, EXPIRED }
}