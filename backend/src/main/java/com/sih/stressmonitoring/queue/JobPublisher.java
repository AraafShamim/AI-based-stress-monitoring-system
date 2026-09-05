package com.sih.stressmonitoring.queue;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class JobPublisher {

    private static final Logger logger = LoggerFactory.getLogger(JobPublisher.class);
    private final RedisTemplate<String, Object> redisTemplate;
    public static final String SCORING_QUEUE = "scoring-jobs";

    public void publishScoringJob(ScoringJob job) {
        redisTemplate.opsForList().rightPush(SCORING_QUEUE, job);
        logger.info("Published async scoring job to Redis for check-in {}", job.getCheckinId());
    }
}
