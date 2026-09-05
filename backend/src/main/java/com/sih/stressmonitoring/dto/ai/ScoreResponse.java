package com.sih.stressmonitoring.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.sih.stressmonitoring.entity.enums.RiskTier;
import com.sih.stressmonitoring.entity.enums.SentimentType;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class ScoreResponse {
    @JsonProperty("dds_score")
    private Integer ddsScore;

    @JsonProperty("risk_tier")
    private RiskTier riskTier;

    @JsonProperty("sentiment_label")
    private SentimentType sentimentLabel;

    @JsonProperty("emotion_signals")
    private Map<String, Object> emotionSignals;

    @JsonProperty("contributing_factors")
    private List<String> contributingFactors;

    @JsonProperty("escalation_flag")
    private Boolean escalationFlag;

    @JsonProperty("confidence_score")
    private BigDecimal confidenceScore;
}
