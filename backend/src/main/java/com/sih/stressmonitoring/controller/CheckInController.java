package com.sih.stressmonitoring.controller;

import com.sih.stressmonitoring.dto.checkin.CheckInRequest;
import com.sih.stressmonitoring.dto.checkin.CheckInResponse;
import com.sih.stressmonitoring.service.CheckInService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/checkins")
@RequiredArgsConstructor
@Tag(name = "Check-ins", description = "Multi-channel ingestion endpoint")
public class CheckInController {

    private final CheckInService checkInService;

    @PostMapping
    @Operation(summary = "Submit a check-in and queue it for async AI scoring")
    public ResponseEntity<CheckInResponse> submitCheckIn(@Valid @RequestBody CheckInRequest request) {
        // Authenticated channels validate token via SecurityFilter. Unauthenticated channels relying on Victim ID + Consent validation are permitted.
        CheckInResponse response = checkInService.ingestCheckIn(request);
        return new ResponseEntity<>(response, HttpStatus.ACCEPTED);
    }
}
