package com.sih.stressmonitoring.repository;

import com.sih.stressmonitoring.entity.Score;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ScoreRepository extends JpaRepository<Score, UUID> {
    boolean existsByCheckInId(UUID checkInId);

    @Query("SELECT s FROM Score s WHERE s.victim.id = :victimId ORDER BY s.createdAt ASC")
    List<Score> findHistoricalScoresByVictimId(UUID victimId, Pageable pageable);
}
