package com.sih.stressmonitoring.repository;

import com.sih.stressmonitoring.entity.Alert;
import com.sih.stressmonitoring.entity.enums.AlertStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AlertRepository extends JpaRepository<Alert, UUID> {
    Page<Alert> findByAssignedToIdAndStatus(UUID counsellorId, AlertStatus status, Pageable pageable);

    // Check if an open alert exists for this check-in to prevent duplicates during retries
    boolean existsByScoreIdAndStatus(UUID scoreId, AlertStatus status);
}
