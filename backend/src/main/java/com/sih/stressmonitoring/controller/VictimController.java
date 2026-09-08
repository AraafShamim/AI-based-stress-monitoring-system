package com.sih.stressmonitoring.controller;

import com.sih.stressmonitoring.audit.AuditLoggingService;
import com.sih.stressmonitoring.entity.User;
import com.sih.stressmonitoring.entity.Victim;
import com.sih.stressmonitoring.repository.UserRepository;
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
    private final UserRepository userRepository;
    private final AuditLoggingService auditLoggingService;

    @GetMapping("/{id}/trend")
    @PreAuthorize("hasAnyRole('COUNSELLOR', 'DISTRICT')")
    @Operation(summary = "DDS trend history for one victim")
    public ResponseEntity<?> getVictimTrend(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        Victim victim = victimRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Victim not found"));

        boolean isAssignedCounsellor = victim.getAssignedCounsellor() != null && victim.getAssignedCounsellor().getId().equals(currentUser.getId());
        boolean isDistrictOrHigher = currentUser.getAuthorities().stream().anyMatch(a -> a.getAuthority().contains("DISTRICT") || a.getAuthority().contains("ADMIN"));

        if (!isAssignedCounsellor && !isDistrictOrHigher) {
            throw new AccessDeniedException("You are not authorized to view this victim's records");
        }

        // DPDP Audit Log
        User actor = userRepository.findById(currentUser.getId()).orElse(null);
        auditLoggingService.logAccess(
                actor, 
                "READ", 
                "victims", 
                victim.getId(), 
                Map.of("endpoint", "trend_history")
        );

        // Simulating the v_victim_distress_trends view output for demo API contract consistency
        List<Map<String, Object>> mockTrend = List.of(
            Map.of("score", 22, "tier", "LOW", "timestamp", "2026-08-01T10:00:00Z"),
            Map.of("score", 54, "tier", "MODERATE", "timestamp", "2026-08-08T10:00:00Z"),
            Map.of("score", 78, "tier", "HIGH", "timestamp", "2026-08-12T10:00:00Z"),
            Map.of("score", 92, "tier", "CRITICAL", "timestamp", "2026-08-15T10:00:00Z")
        );

        return ResponseEntity.ok(mockTrend);
    }
}
