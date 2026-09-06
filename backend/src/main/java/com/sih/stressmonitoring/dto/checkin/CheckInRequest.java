package com.sih.stressmonitoring.dto.checkin;

import com.sih.stressmonitoring.entity.enums.ChannelType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Data
public class CheckInRequest {

    @NotNull(message = "Victim ID is required")
    private UUID victimId;

    @NotNull(message = "Channel is required")
    private ChannelType channel;

    private String rawText;

    private String audioRef;

    @PositiveOrZero(message = "Latency must be positive or zero")
    private BigDecimal responseLatencySec;

    // Structured metadata e.g. mood, sleep, safety
    private Map<String, Object> metadata;

    private Boolean isMissed = false;
}
