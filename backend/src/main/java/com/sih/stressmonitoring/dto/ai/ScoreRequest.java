package com.sih.stressmonitoring.dto.ai;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * Payload for POST /ai/v1/score — mirrors ai-service ScoreRequest.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ScoreRequest(
        @JsonProperty("checkin_id") String checkinId,
        @JsonProperty("text") String text,
        @JsonProperty("language") String language,
        @JsonProperty("recent_history") List<String> recentHistory,
        @JsonProperty("previous_dds_scores") List<Integer> previousDdsScores,
        @JsonProperty("response_latency_sec") Integer responseLatencySec,
        @JsonProperty("age_group") String ageGroup,
        @JsonProperty("gender") String gender,
        @JsonProperty("location") String location
) {
    public ScoreRequest {
        if (language == null || language.isBlank()) {
            language = "en";
        }
        if (recentHistory == null) {
            recentHistory = List.of();
        }
        if (previousDdsScores == null) {
            previousDdsScores = List.of();
        }
        if (responseLatencySec == null) {
            responseLatencySec = 0;
        }
    }
}
