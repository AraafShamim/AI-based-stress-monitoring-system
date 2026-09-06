package com.sih.stressmonitoring.repository;

import com.sih.stressmonitoring.entity.Victim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VictimRepository extends JpaRepository<Victim, UUID> {
    Optional<Victim> findByCaseId(String caseId);
    List<Victim> findByAssignedCounsellorId(UUID assignedCounsellorId);
}
