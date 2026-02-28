package com.insurai.controller;

import com.insurai.model.Policy;
import com.insurai.service.PolicyService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/policies")
public class PolicyController {

    private final PolicyService policyService;

    public PolicyController(PolicyService policyService) {
        this.policyService = policyService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Policy>> getUserPolicies(@PathVariable Long userId) {
        return ResponseEntity.ok(policyService.getPoliciesByUser(userId));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Policy>> getAllPolicies() {
        return ResponseEntity.ok(policyService.getAllPolicies());
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Policy>> getPendingPolicies() {
        return ResponseEntity.ok(policyService.getPendingPolicies());
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<Policy> createPolicy(@PathVariable Long userId,
                                               @RequestBody Policy policy) {
        return ResponseEntity.ok(policyService.createPolicy(policy, userId));
    }

    @PatchMapping("/{policyId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Policy> updateStatus(@PathVariable Long policyId,
                                               @RequestParam Policy.PolicyStatus status) {
        return ResponseEntity.ok(policyService.updatePolicyStatus(policyId, status));
    }
}