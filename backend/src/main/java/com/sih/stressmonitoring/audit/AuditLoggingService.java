package com.sih.stressmonitoring.audit;

import com.sih.stressmonitoring.entity.AuditLog;
import com.sih.stressmonitoring.entity.User;
import com.sih.stressmonitoring.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditLoggingService {
    
    private final AuditLogRepository auditLogRepository;
    
    public void logAccess(User actor, String action, String entityType, UUID entityId, Map<String, Object> details) {
        if (actor == null || entityId == null) return;
        AuditLog logEntry = AuditLog.builder()
                .actorUser(actor)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .details(details == null ? Map.of() : details)
                .build();
        auditLogRepository.save(logEntry);
    }
}
