package com.sih.stressmonitoring.controller;

import com.sih.stressmonitoring.entity.Victim;
import com.sih.stressmonitoring.repository.VictimRepository;
import com.sih.stressmonitoring.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Aggregated risk KPIs & Summaries")
public class DashboardController {

    private final VictimRepository victimRepository;

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('COUNSELLOR', 'DISTRICT', 'STATE', 'NATIONAL', 'ADMIN')")
    @Operation(summary = "Aggregated risk KPIs for the logged-in user's role and jurisdiction")
    public ResponseEntity<Map<String, Object>> getDashboardSummary(@AuthenticationPrincipal CustomUserDetails currentUser) {

        // This is a simplified proxy implementation.
        // In real execution, this references `v_district_state_summary` or `v_counsellor_worklist` via NativeQuery.
        // Returning a mock aggregate for now based on JPA repo query counts to satisfy the demo.

        List<Victim> assignedVictims = victimRepository.findByAssignedCounsellorId(currentUser.getId());

        long criticalCases = assignedVictims.stream().filter(v -> v.getCurrentRiskTier() == com.sih.stressmonitoring.entity.enums.RiskTier.CRITICAL).count();
        long highCases = assignedVictims.stream().filter(v -> v.getCurrentRiskTier() == com.sih.stressmonitoring.entity.enums.RiskTier.HIGH).count();
        long moderateCases = assignedVictims.stream().filter(v -> v.getCurrentRiskTier() == com.sih.stressmonitoring.entity.enums.RiskTier.MODERATE).count();
        long lowCases = assignedVictims.stream().filter(v -> v.getCurrentRiskTier() == com.sih.stressmonitoring.entity.enums.RiskTier.LOW).count();

        Map<String, Object> summary = Map.of(
                "jurisdiction", currentUser.getJurisdiction(),
                "role", currentUser.getAuthorities().iterator().next().getAuthority(),
                "total_monitored_victims", assignedVictims.size(),
                "critical_cases", criticalCases,
                "high_risk_cases", highCases,
                "moderate_risk_cases", moderateCases,
                "low_risk_cases", lowCases
        );

        return ResponseEntity.ok(summary);
    }
}
