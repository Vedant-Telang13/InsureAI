package com.insurai.service;

import com.insurai.model.Policy;
import com.insurai.model.User;
import com.insurai.repository.PolicyRepository;
import com.insurai.repository.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PolicyService {

    private final PolicyRepository policyRepository;
    private final UserRepository   userRepository;

    public PolicyService(PolicyRepository policyRepository,
                         UserRepository userRepository) {
        this.policyRepository = policyRepository;
        this.userRepository   = userRepository;
    }

    public List<Policy> getAllPolicies() {
        return policyRepository.findAll();
    }

    public List<Policy> getPoliciesByUser(Long userId) {
        return policyRepository.findByUserId(userId);
    }

    public List<Policy> getPendingPolicies() {
        return policyRepository.findByStatus(Policy.PolicyStatus.PENDING);
    }

    public Policy createPolicy(Policy policy, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        policy.setUser(user);
        policy.setStatus(Policy.PolicyStatus.PENDING);
        return policyRepository.save(policy);
    }

    public Policy updatePolicyStatus(Long policyId, Policy.PolicyStatus status) {
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new RuntimeException("Policy not found"));
        policy.setStatus(status);
        return policyRepository.save(policy);
    }

    public Policy getPolicyById(Long id) {
        return policyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Policy not found"));
    }
}