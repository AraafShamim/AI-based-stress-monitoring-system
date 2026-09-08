package com.sih.stressmonitoring.service;

import com.sih.stressmonitoring.dto.ai.EmotionSignals;
import com.sih.stressmonitoring.dto.ai.ScoreRequest;
import com.sih.stressmonitoring.dto.ai.ScoreResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.time.Duration;
import java.util.List;

@Service
public class AiScoringService {

    private static final Logger log = LoggerFactory.getLogger(AiScoringService.class);
    private static final String SCORE_PATH = "/ai/v1/score";

    private final RestClient restClient;

    public AiScoringService(
            RestClient.Builder restClientBuilder,
            @Value("${ai.service.url:http://localhost:8000}") String aiServiceUrl
    ) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(3));
        requestFactory.setReadTimeout(Duration.ofSeconds(15));

        this.restClient = restClientBuilder
                .baseUrl(aiServiceUrl)
                .requestFactory(requestFactory)
                .build();
    }

    /**
     * Posts a check-in to the ML scoring service. If the service is down or
     * returns an error, a conservative fallback score is returned instead of
     * throwing, so callers (e.g. the scoring worker) keep running.
     */
    public ScoreResponse score(ScoreRequest request) {
        try {
            ScoreResponse response = restClient.post()
                    .uri(SCORE_PATH)
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(ScoreResponse.class);

            if (response == null) {
                log.warn("ML scoring service returned an empty body for checkin_id={}", request.checkinId());
                throw new RuntimeException("Empty response from ML scoring service");
            }
            return response;
        } catch (RestClientException ex) {
            log.error(
                    "ML scoring service unreachable or failed for checkin_id={}: {}",
                    request.checkinId(),
                    ex.getMessage()
            );
            // Throw exception to trigger retry in ScoringWorker instead of a fake Low score fallback
            throw new RuntimeException("ML scoring service unavailable, triggering retry queue", ex);
        }
    }

}
