package com.sih.stressmonitoring.controller;

import com.sih.stressmonitoring.entity.CheckIn;
import com.sih.stressmonitoring.entity.Score;
import com.sih.stressmonitoring.entity.Victim;
import com.sih.stressmonitoring.repository.CheckInRepository;
import com.sih.stressmonitoring.repository.ScoreRepository;
import com.sih.stressmonitoring.repository.VictimRepository;
import com.sih.stressmonitoring.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/victims")
@RequiredArgsConstructor
@Tag(name = "Victims", description = "Endpoints for Victim Data and Trends")
public class VictimController {

    private final VictimRepository victimRepository;
    private final CheckInRepository checkInRepository;

    @GetMapping("/{id}/trend")
    @PreAuthorize("hasAnyRole('COUNSELLOR', 'DISTRICT')")
    @Operation(summary = "DDS trend history for one victim")
    public ResponseEntity<?> getVictimTrend(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        Victim victim = victimRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Victim not found"));

        if (!victim.getAssignedCounsellor().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You are not assigned to this victim");
        }

        // Simulating the v_victim_distress_trends view output for demo API contract consistency
        // A real impl uses native queries mapped to DTO projections

        List<Map<String, Object>> mockTrend = List.of(
            Map.of("score", 22, "tier", "LOW", "timestamp", "2026-08-01T10:00:00Z"),
            Map.of("score", 54, "tier", "MODERATE", "timestamp", "2026-08-08T10:00:00Z"),
            Map.of("score", 78, "tier", "HIGH", "timestamp", "2026-08-12T10:00:00Z"),
            Map.of("score", 92, "tier", "CRITICAL", "timestamp", "2026-08-15T10:00:00Z")
        );

        return ResponseEntity.ok(mockTrend);
    }
}
