package com.sih.stressmonitoring.repository;

import com.sih.stressmonitoring.entity.Score;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ScoreRepository extends JpaRepository<Score, UUID> {
    boolean existsByCheckInId(UUID checkInId);
}
