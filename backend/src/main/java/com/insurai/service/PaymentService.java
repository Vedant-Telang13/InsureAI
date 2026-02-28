package com.insurai.service;

import com.insurai.model.Payment;
import com.insurai.model.Policy;
import com.insurai.model.User;
import com.insurai.repository.PaymentRepository;
import com.insurai.repository.PolicyRepository;
import com.insurai.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PolicyRepository  policyRepository;
    private final UserRepository    userRepository;

    public PaymentService(PaymentRepository paymentRepository,
                          PolicyRepository policyRepository,
                          UserRepository userRepository) {
        this.paymentRepository = paymentRepository;
        this.policyRepository  = policyRepository;
        this.userRepository    = userRepository;
    }

    public List<Payment> getPaymentsByUser(Long userId) {
        return paymentRepository.findByUserId(userId);
    }

    public Payment makePayment(Long userId, Long policyId, Payment payment) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new RuntimeException("Policy not found"));
        payment.setUser(user);
        payment.setPolicy(policy);
        payment.setStatus(Payment.PaymentStatus.PAID);
        return paymentRepository.save(payment);
    }
}