package com.insurai.repository;

import com.insurai.model.Claim;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClaimRepository extends JpaRepository<Claim, Long> {
    List<Claim> findByUserId(Long userId);
    List<Claim> findByStatus(Claim.ClaimStatus status);
    List<Claim> findByPolicyId(Long policyId);
}