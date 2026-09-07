package com.sih.stressmonitoring.dto.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * JSON body returned by POST /ai/v1/score.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record ScoreResponse(
        @JsonProperty("dds_score") Integer ddsScore,
        @JsonProperty("risk_tier") String riskTier,
        @JsonProperty("sentiment_label") String sentimentLabel,
        @JsonProperty("emotion_signals") EmotionSignals emotionSignals,
        @JsonProperty("contributing_factors") List<String> contributingFactors,
        @JsonProperty("trigger_words") List<String> triggerWords,
        @JsonProperty("escalation_flag") Boolean escalationFlag
) {
}
