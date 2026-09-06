package com.sih.stressmonitoring.dto;

import com.sih.stressmonitoring.entity.enums.ConsentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class ConsentRequest {
    @NotNull(message = "Victim ID is required")
    private UUID victimId;

    @NotNull(message = "Consent status is required")
    private ConsentStatus status;

    private String reason;
}
