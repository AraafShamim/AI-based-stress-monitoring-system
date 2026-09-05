package com.sih.stressmonitoring.ai;

import com.sih.stressmonitoring.dto.ai.ScoreRequest;
import com.sih.stressmonitoring.dto.ai.ScoreResponse;
import com.sih.stressmonitoring.entity.enums.RiskTier;
import com.sih.stressmonitoring.entity.enums.SentimentType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class AiServiceClient {

    private final WebClient webClient;
    private final boolean useMock;

    public AiServiceClient(WebClient.Builder webClientBuilder,
                           @Value("${ai.service.url}") String aiServiceUrl,
                           @Value("${ai.service.use-mock}") boolean useMock) {
        this.webClient = webClientBuilder.baseUrl(aiServiceUrl).build();
        this.useMock = useMock;
    }

    public ScoreResponse getScore(ScoreRequest request) {
        if (useMock) {
            return generateMockScore(request);
        }

        // Real internal AI Client contract interaction
        return webClient.post()
                .uri("/ai/v1/score")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(ScoreResponse.class)
                .block();
    }

    private ScoreResponse generateMockScore(ScoreRequest request) {
        // Deterministic realistic behavior based on the PRD "escalation" mock pattern
        int dds = parseMockDdsScore(request.getText());
        RiskTier alertTier = determineRisk(dds);
        boolean escalates = (dds >= 70);

        ScoreResponse response = new ScoreResponse();
        response.setDdsScore(dds);
        response.setRiskTier(alertTier);
        response.setSentimentLabel(escalates ? SentimentType.NEGATIVE : SentimentType.POSITIVE); // Simplified mapping
        response.setEmotionSignals(Map.of("voice_stress", dds / 100.0, "flat_affect", 0.41));
        response.setContributingFactors(escalates ?
                List.of("negative sentiment detected in mock engine", "escalating distress pattern simulated") :
                List.of("stable mock text", "stable response"));
        response.setEscalationFlag(escalates);
        response.setConfidenceScore(BigDecimal.valueOf(0.95));

        return response;
    }

    private int parseMockDdsScore(String text) {
        if (text == null) return 22; // Low
        text = text.toLowerCase();
        if (text.contains("critical") || text.contains("madad") || text.contains("help") || text.contains("threat")) {
            return ThreadLocalRandom.current().nextInt(90, 100);
        }
        if (text.contains("high") || text.contains("scared") || text.contains("anxious")) {
            return ThreadLocalRandom.current().nextInt(70, 89);
        }
        if (text.contains("moderate") || text.contains("worried")) {
            return ThreadLocalRandom.current().nextInt(41, 69);
        }
        return ThreadLocalRandom.current().nextInt(10, 40); // default low
    }

    private RiskTier determineRisk(int dds) {
        if (dds > 89) return RiskTier.CRITICAL;
        if (dds >= 70) return RiskTier.HIGH;
        if (dds >= 40) return RiskTier.MODERATE;
        return RiskTier.LOW;
    }
}
