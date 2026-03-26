package com.teamflow.service;

import com.teamflow.dto.UserRequest;
import com.teamflow.dto.UserResponse;
import com.teamflow.entity.User;
import com.teamflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepo;
    private final PasswordEncoder encoder;

    public List<UserResponse> getAll() {
        return userRepo.findAll().stream()
                .map(UserResponse::from)
                .toList();
    }

    public UserResponse getById(Long id) {
        return userRepo.findById(id)
                .map(UserResponse::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    public UserResponse create(UserRequest req) {
        if (userRepo.existsByEmail(req.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already in use");
        }

        User.Role role;
        try {
            role = User.Role.valueOf(req.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role: " + req.getRole());
        }

        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .passwordHash(encoder.encode(req.getPassword()))
                .role(role)
                .build();

        return UserResponse.from(userRepo.save(user));
    }
}
