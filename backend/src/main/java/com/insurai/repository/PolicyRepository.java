package com.insurai.repository;

import com.insurai.model.Policy;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PolicyRepository extends JpaRepository<Policy, Long> {
    List<Policy> findByUserId(Long userId);
    List<Policy> findByStatus(Policy.PolicyStatus status);
}