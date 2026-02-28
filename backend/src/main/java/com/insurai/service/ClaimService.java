package com.insurai.service;

import com.insurai.model.Claim;
import com.insurai.model.Policy;
import com.insurai.model.User;
import com.insurai.repository.ClaimRepository;
import com.insurai.repository.PolicyRepository;
import com.insurai.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClaimService {

    private final ClaimRepository claimRepository;
    private final PolicyRepository policyRepository;
    private final UserRepository userRepository;

    public ClaimService(ClaimRepository claimRepository,
                        PolicyRepository policyRepository,
                        UserRepository userRepository) {
        this.claimRepository = claimRepository;
        this.policyRepository = policyRepository;
        this.userRepository = userRepository;
    }

    public List<Claim> getAllClaims() {
        return claimRepository.findAll();
    }

    public List<Claim> getClaimsByUser(Long userId) {
        return claimRepository.findByUserId(userId);
    }

    public List<Claim> getPendingClaims() {
        return claimRepository.findByStatus(Claim.ClaimStatus.PENDING);
    }

    public Claim createClaim(Claim claim, Long userId, Long policyId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new RuntimeException("Policy not found"));
        claim.setUser(user);
        claim.setPolicy(policy);
        claim.setStatus(Claim.ClaimStatus.PENDING);
        return claimRepository.save(claim);
    }

    public Claim updateClaimStatus(Long claimId, Claim.ClaimStatus status) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found"));
        claim.setStatus(status);
        return claimRepository.save(claim);
    }
}