package com.sih.stressmonitoring.ai;

import com.sih.stressmonitoring.dto.ai.ScoreRequest;
import com.sih.stressmonitoring.dto.ai.ScoreResponse;
import com.sih.stressmonitoring.service.AiScoringService;
import org.springframework.stereotype.Service;

/**
 * Compatibility facade over {@link AiScoringService}. Prefer injecting AiScoringService directly.
 */
@Service
public class AiServiceClient {

    private final AiScoringService aiScoringService;

    public AiServiceClient(AiScoringService aiScoringService) {
        this.aiScoringService = aiScoringService;
    }

    public ScoreResponse getScore(ScoreRequest request) {
        return aiScoringService.score(request);
    }
}
