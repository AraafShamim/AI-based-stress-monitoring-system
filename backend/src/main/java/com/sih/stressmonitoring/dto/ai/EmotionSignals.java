package com.sih.stressmonitoring.dto.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record EmotionSignals(
        @JsonProperty("voice_stress") Double voiceStress,
        @JsonProperty("flat_affect") Double flatAffect
) {
}
