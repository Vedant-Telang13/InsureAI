package com.insurai.controller;

import com.insurai.model.Payment;
import com.insurai.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Payment>> getUserPayments(@PathVariable Long userId) {
        return ResponseEntity.ok(paymentService.getPaymentsByUser(userId));
    }

    @PostMapping("/user/{userId}/policy/{policyId}")
    public ResponseEntity<Payment> makePayment(@PathVariable Long userId,
                                               @PathVariable Long policyId,
                                               @RequestBody Payment payment) {
        return ResponseEntity.ok(paymentService.makePayment(userId, policyId, payment));
    }
}
