package com.sih.stressmonitoring.controller;

import com.sih.stressmonitoring.dto.auth.LoginRequest;
import com.sih.stressmonitoring.dto.auth.LoginResponse;
import com.sih.stressmonitoring.security.CustomUserDetails;
import com.sih.stressmonitoring.security.JwtUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Date;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints for staff login and token management")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    @PostMapping("/login")
    @Operation(summary = "Authenticate a counsellor or official and return a JWT")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String jwtToken = jwtUtils.generateToken(userDetails);

        String role = userDetails.getAuthorities().stream()
                .findFirst()
                .map(GrantedAuthority::getAuthority)
                .map(r -> r.replace("ROLE_", ""))
                .orElse("UNKNOWN");

        LoginResponse response = LoginResponse.builder()
                .token(jwtToken)
                .type("Bearer")
                .id(userDetails.getId())
                .name(userDetails.getUsername())
                .email(userDetails.getUsername())
                .role(role)
                .jurisdiction(userDetails.getJurisdiction())
                .issuedAt(Instant.now())
                .expiresAt(jwtUtils.extractExpiration(jwtToken).toInstant())
                .build();

        return ResponseEntity.ok(response);
    }
}
