package com.sih.stressmonitoring.repository;

import com.sih.stressmonitoring.entity.Consent;
import com.sih.stressmonitoring.entity.enums.ConsentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConsentRepository extends JpaRepository<Consent, UUID> {

    // We only care about the latest active granted consent
    Optional<Consent> findFirstByVictimIdAndStatusOrderByCreatedAtDesc(UUID victimId, ConsentStatus status);
}
