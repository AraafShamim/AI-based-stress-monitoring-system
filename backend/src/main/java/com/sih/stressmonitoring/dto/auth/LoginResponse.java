package com.sih.stressmonitoring.dto.auth;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class LoginResponse {
    private String token;
    private String type;
    private UUID id;
    private String name;
    private String email;
    private String role;
    private String jurisdiction;
    private Instant issuedAt;
    private Instant expiresAt;
}
