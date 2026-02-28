package com.insurai.controller;

import com.insurai.model.Claim;
import com.insurai.service.ClaimService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/claims")
public class ClaimController {

    private final ClaimService claimService;

    public ClaimController(ClaimService claimService) {
        this.claimService = claimService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Claim>> getUserClaims(@PathVariable Long userId) {
        return ResponseEntity.ok(claimService.getClaimsByUser(userId));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Claim>> getAllClaims() {
        return ResponseEntity.ok(claimService.getAllClaims());
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Claim>> getPendingClaims() {
        return ResponseEntity.ok(claimService.getPendingClaims());
    }

    @PostMapping("/user/{userId}/policy/{policyId}")
    public ResponseEntity<Claim> submitClaim(@PathVariable Long userId,
                                             @PathVariable Long policyId,
                                             @RequestBody Claim claim) {
        return ResponseEntity.ok(claimService.createClaim(claim, userId, policyId));
    }

    @PatchMapping("/{claimId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Claim> updateStatus(@PathVariable Long claimId,
                                              @RequestParam Claim.ClaimStatus status) {
        return ResponseEntity.ok(claimService.updateClaimStatus(claimId, status));
    }
}

