package com.sih.stressmonitoring.controller;

import com.sih.stressmonitoring.dto.auth.LoginResponse;
import com.sih.stressmonitoring.dto.auth.OtpRequest;
import com.sih.stressmonitoring.entity.User;
import com.sih.stressmonitoring.entity.enums.OtpPurpose;
import com.sih.stressmonitoring.security.CustomUserDetails;
import com.sih.stressmonitoring.security.JwtUtils;
import com.sih.stressmonitoring.service.OtpService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Optional;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth/otp")
@RequiredArgsConstructor
@Tag(name = "OTP Authentication", description = "Endpoints for OTP Request & Verification")
public class AuthOtpController {

    private final OtpService otpService;
    private final JwtUtils jwtUtils;

    @PostMapping("/request")
    @Operation(summary = "Request an OTP for Login, Verification, or Password Reset")
    public ResponseEntity<Void> requestOtp(@Valid @RequestBody OtpRequest request) {
        otpService.generateAndSendOtp(request.getPhoneNumber(), request.getPurpose());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/verify")
    @Operation(summary = "Verify OTP and generate Auth Token if purpose is LOGIN")
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody OtpRequest request) {
        if (request.getOtp() == null || request.getOtp().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "OTP code missing"));
        }

        Optional<User> userOpt = otpService.verifyOtp(request.getPhoneNumber(), request.getOtp(), request.getPurpose());

        if (request.getPurpose() == OtpPurpose.LOGIN && userOpt.isPresent()) {
            User user = userOpt.get();
            CustomUserDetails userDetails = new CustomUserDetails(user);
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
                    .name(user.getName())
                    .email(user.getEmail())
                    .role(role)
                    .jurisdiction(userDetails.getJurisdiction())
                    .issuedAt(Instant.now())
                    .expiresAt(jwtUtils.extractExpiration(jwtToken).toInstant())
                    .build();

            return ResponseEntity.ok(response);
        }

        return ResponseEntity.ok().build();
    }
}
