package com.sih.stressmonitoring.repository;

import com.sih.stressmonitoring.entity.CheckIn;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CheckInRepository extends JpaRepository<CheckIn, UUID> {
    List<CheckIn> findByProcessingStatus(String processingStatus, Pageable pageable);
}
