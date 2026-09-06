package com.sih.stressmonitoring.controller;

import com.sih.stressmonitoring.dto.ConsentRequest;
import com.sih.stressmonitoring.entity.Consent;
import com.sih.stressmonitoring.entity.Victim;
import com.sih.stressmonitoring.repository.ConsentRepository;
import com.sih.stressmonitoring.repository.VictimRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/v1/consent")
@RequiredArgsConstructor
@Tag(name = "Consent", description = "Endpoints for DPDP Act 2023 Consent History")
public class ConsentController {

    private final ConsentRepository consentRepository;
    private final VictimRepository victimRepository;

    @PostMapping
    @PreAuthorize("hasAnyRole('COUNSELLOR', 'DISTRICT', 'ADMIN')")
    @Operation(summary = "Record victim consent grant or withdrawal")
    public ResponseEntity<Consent> recordConsent(@Valid @RequestBody ConsentRequest request) {

        Victim victim = victimRepository.findById(request.getVictimId())
                .orElseThrow(() -> new NoSuchElementException("Victim not found"));

        Consent consent = Consent.builder()
                .victim(victim)
                .scope("mental_health_monitoring")
                .status(request.getStatus())
                .reason(request.getReason())
                .build();

        // If withdrawn, set withdrawn at
        if (request.getStatus() == com.sih.stressmonitoring.entity.enums.ConsentStatus.WITHDRAWN) {
            consent.setWithdrawnAt(Instant.now());
            // Optionally disable monitoring automatically via business rule
            victim.setMonitoringActive(false);
            victimRepository.save(victim);
        } else {
            victim.setMonitoringActive(true);
            victimRepository.save(victim);
        }

        Consent savedConsent = consentRepository.save(consent);

        // A realistic implementation would write to AuditLogRepository here recognizing "CONSENT_CHANGE"

        return ResponseEntity.ok(savedConsent);
    }
}
