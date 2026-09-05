package com.sih.stressmonitoring.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class ScoreRequest {
    @JsonProperty("checkin_id")
    private UUID checkinId;

    @JsonProperty("victim_id")
    private UUID victimId;

    @JsonProperty("text")
    private String text;

    @JsonProperty("audio_ref")
    private String audioRef;
}
