package com.sih.stressmonitoring.dto.checkin;

import com.sih.stressmonitoring.entity.enums.ChannelType;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class CheckInResponse {
    private UUID id;
    private UUID victimId;
    private ChannelType channel;
    private Instant createdAt;
    private String status; // Pending, Processing, etc. for frontend async view
}
