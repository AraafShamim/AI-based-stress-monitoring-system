package com.sih.stressmonitoring.repository;

import com.sih.stressmonitoring.entity.UserSmsEvent;
import com.sih.stressmonitoring.entity.enums.SmsMessageType;
import com.sih.stressmonitoring.entity.enums.SmsStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserSmsEventRepository extends JpaRepository<UserSmsEvent, UUID> {

    boolean existsByScoreIdAndMessageType(UUID scoreId, SmsMessageType type);

    Optional<UserSmsEvent> findFirstByPhoneNumberAndStatusInOrderByCreatedAtDesc(String phoneNumber, List<SmsStatus> statuses);

    List<UserSmsEvent> findByStatusAndFollowUpDueAtBefore(SmsStatus status, Instant time);

    Optional<UserSmsEvent> findFirstByVictimIdAndMessageTypeOrderByCreatedAtDesc(UUID victimId, SmsMessageType type);
}
