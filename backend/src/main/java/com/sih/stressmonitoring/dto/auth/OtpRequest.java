package com.sih.stressmonitoring.dto.auth;

import com.sih.stressmonitoring.entity.enums.OtpPurpose;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OtpRequest {
    @NotBlank(message = "Phone number is required")
    private String phoneNumber;

    @NotNull(message = "Purpose is required")
    private OtpPurpose purpose;
    
    private String otp; // Used in verification payload
}
