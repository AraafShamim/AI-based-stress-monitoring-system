package com.sih.stressmonitoring.service;

import com.sih.stressmonitoring.entity.User;
import com.sih.stressmonitoring.entity.enums.UserRole;
import com.sih.stressmonitoring.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserRegistrationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Register a new user
     * @param email User's email address
     * @param password User's password (will be hashed)
     * @param name User's full name
     * @param phone User's phone number (optional)
     * @param role User role (COUNSELLOR, DISTRICT, STATE, ADMIN)
     * @param jurisdiction User's jurisdiction
     * @return Registered user entity
     * @throws IllegalArgumentException if email already exists
     */
    public User registerUser(String email, String password, String name, String phone, UserRole role, String jurisdiction) {
        // Check if email already exists
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email already registered: " + email);
        }

        // Check if phone already exists (if provided)
        if (phone != null && !phone.trim().isEmpty()) {
            if (userRepository.findByPhone(phone).isPresent()) {
                throw new IllegalArgumentException("Phone number already registered: " + phone);
            }
        }

        // Create and save user
        User user = User.builder()
                .id(UUID.randomUUID())
                .name(name)
                .email(email.toLowerCase().trim())
                .phone(phone != null ? phone.trim() : null)
                .role(role != null ? role : UserRole.COUNSELLOR)
                .jurisdiction(jurisdiction != null ? jurisdiction.trim() : "General")
                .passwordHash(passwordEncoder.encode(password))
                .isActive(true)
                .phoneVerified(false)
                .build();

        return userRepository.save(user);
    }
}
