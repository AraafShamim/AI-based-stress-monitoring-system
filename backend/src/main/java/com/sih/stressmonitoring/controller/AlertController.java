package com.sih.stressmonitoring.controller;

import com.sih.stressmonitoring.audit.AuditLoggingService;
import com.sih.stressmonitoring.entity.Alert;
import com.sih.stressmonitoring.entity.User;
import com.sih.stressmonitoring.entity.enums.AlertStatus;
import com.sih.stressmonitoring.repository.AlertRepository;
import com.sih.stressmonitoring.repository.UserRepository;
import com.sih.stressmonitoring.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/alerts")
@RequiredArgsConstructor
@Tag(name = "Alerts", description = "Endpoints for Counsellor Alert Worklist")
public class AlertController {

    private final AlertRepository alertRepository;
    private final UserRepository userRepository;
    private final AuditLoggingService auditLoggingService;

    @GetMapping
    @PreAuthorize("hasRole('COUNSELLOR')")
    @Operation(summary = "Get prioritized alert worklist for the logged-in counsellor")
    public ResponseEntity<Page<Alert>> getOpenAlerts(
            @RequestParam(defaultValue = "OPEN") AlertStatus status,
            Pageable pageable,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        Page<Alert> alerts = alertRepository.findByAssignedToIdAndStatus(currentUser.getId(), status, pageable);
        return ResponseEntity.ok(alerts);
    }

    @PostMapping("/{id}/ack")
    @PreAuthorize("hasRole('COUNSELLOR')")
    @Operation(summary = "Acknowledge an alert and log the outcome taken")
    public ResponseEntity<Alert> acknowledgeAlert(
            @PathVariable UUID id,
            @RequestBody AlertAckRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Alert not found"));

        if (alert.getAssignedTo() != null && !alert.getAssignedTo().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You are not assigned to this alert");
        }

        alert.setStatus(request.getStatus());
        alert.setOutcomeNotes(request.getOutcomeNotes());

        if (request.getStatus() == AlertStatus.ACKNOWLEDGED) {
            alert.setAcknowledgedAt(Instant.now());
        } else if (request.getStatus() == AlertStatus.RESOLVED || request.getStatus() == AlertStatus.FALSE_POSITIVE) {
            alert.setResolvedAt(Instant.now());
        }

        Alert savedAlert = alertRepository.save(alert);

        // Audit Trail for DPDP compliance
        User actor = userRepository.findById(currentUser.getId()).orElse(null);
        auditLoggingService.logAccess(
                actor,
                "ALERT_ACK",
                "alerts",
                savedAlert.getId(),
                Map.of("status", request.getStatus().name(), "notes", request.getOutcomeNotes() != null ? request.getOutcomeNotes() : "")
        );

        return ResponseEntity.ok(savedAlert);
    }

    @Data
    public static class AlertAckRequest {
        private AlertStatus status;
        private String outcomeNotes;
    }
}
