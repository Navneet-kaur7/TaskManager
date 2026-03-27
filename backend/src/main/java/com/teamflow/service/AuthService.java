package com.teamflow.service;

import com.teamflow.dto.AuthResponse;
import com.teamflow.dto.LoginRequest;
import com.teamflow.dto.RecoveryReactivateRequest;
import com.teamflow.dto.RegisterRequest;
import com.teamflow.entity.User;
import com.teamflow.repository.UserRepository;
import com.teamflow.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;

    @Value("${app.recovery.key:}")
    private String recoveryKey;

    public AuthResponse register(RegisterRequest req) {
        if (userRepo.existsByEmail(req.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already in use");
        }

        User.Role role = userRepo.count() == 0 ? User.Role.ADMIN : User.Role.USER;

        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .passwordHash(encoder.encode(req.getPassword()))
                .role(role)
                .build();

        user = userRepo.save(user);
        String token = jwtUtil.generate(user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole().name(), user.isActive());
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepo.findByEmail(req.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!user.isActive()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User account is deactivated");
        }

        if (!encoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        String token = jwtUtil.generate(user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole().name(), user.isActive());
    }

    public AuthResponse reactivateByRecovery(RecoveryReactivateRequest req) {
        if (recoveryKey == null || recoveryKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Recovery key is not configured on server");
        }
        if (!recoveryKey.equals(req.getRecoveryKey())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid recovery key");
        }

        User user = userRepo.findByEmail(req.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!user.isActive()) {
            user.setActive(true);
            user = userRepo.save(user);
        }

        String token = jwtUtil.generate(user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole().name(), user.isActive());
    }
}
