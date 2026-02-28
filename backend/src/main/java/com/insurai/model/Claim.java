package com.insurai.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "claims")
public class Claim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "policy_id", nullable = false)
    private Policy policy;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "claim_number", nullable = false, unique = true)
    private String claimNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ClaimType type;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private ClaimStatus status = ClaimStatus.PENDING;

    @Column(name = "submitted_at", updatable = false)
    private LocalDateTime submittedAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        submittedAt = LocalDateTime.now();
        updatedAt   = LocalDateTime.now();
        if (claimNumber == null) claimNumber = "CLM-" + System.currentTimeMillis();
    }

    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    public Long getId()                       { return id; }
    public Policy getPolicy()                 { return policy; }
    public User getUser()                     { return user; }
    public String getClaimNumber()            { return claimNumber; }
    public ClaimType getType()                { return type; }
    public BigDecimal getAmount()             { return amount; }
    public String getDescription()            { return description; }
    public ClaimStatus getStatus()            { return status; }
    public LocalDateTime getSubmittedAt()     { return submittedAt; }
    public LocalDateTime getUpdatedAt()       { return updatedAt; }

    public void setId(Long v)                 { this.id = v; }
    public void setPolicy(Policy v)           { this.policy = v; }
    public void setUser(User v)               { this.user = v; }
    public void setClaimNumber(String v)      { this.claimNumber = v; }
    public void setType(ClaimType v)          { this.type = v; }
    public void setAmount(BigDecimal v)       { this.amount = v; }
    public void setDescription(String v)      { this.description = v; }
    public void setStatus(ClaimStatus v)      { this.status = v; }

    public enum ClaimType   { MEDICAL, ACCIDENT, PROPERTY_DAMAGE, THEFT, OTHER }
    public enum ClaimStatus { PENDING, UNDER_REVIEW, APPROVED, REJECTED }
}