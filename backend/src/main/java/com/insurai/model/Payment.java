package com.insurai.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {

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

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "payment_date")
    private LocalDateTime paymentDate;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(name = "card_last4", length = 4)
    private String cardLast4;

    public Payment() {}

    public Long getId()                   { return id; }
    public Policy getPolicy()             { return policy; }
    public User getUser()                 { return user; }
    public BigDecimal getAmount()         { return amount; }
    public LocalDateTime getPaymentDate() { return paymentDate; }
    public PaymentStatus getStatus()      { return status; }
    public String getCardLast4()          { return cardLast4; }

    public void setId(Long v)                   { this.id = v; }
    public void setPolicy(Policy v)             { this.policy = v; }
    public void setUser(User v)                 { this.user = v; }
    public void setAmount(BigDecimal v)         { this.amount = v; }
    public void setPaymentDate(LocalDateTime v) { this.paymentDate = v; }
    public void setStatus(PaymentStatus v)      { this.status = v; }
    public void setCardLast4(String v)          { this.cardLast4 = v; }

    @PrePersist
    protected void onCreate() { paymentDate = LocalDateTime.now(); }

    public enum PaymentStatus { PAID, PENDING, FAILED }
}