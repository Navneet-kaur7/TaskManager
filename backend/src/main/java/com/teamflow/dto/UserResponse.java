package com.teamflow.dto;

import com.teamflow.entity.User;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private String role;
    private boolean active;
    private LocalDateTime createdAt;

    public static UserResponse from(User u) {
        UserResponse r = new UserResponse();
        r.id = u.getId();
        r.name = u.getName();
        r.email = u.getEmail();
        r.role = u.getRole().name();
        r.active = u.isActive();
        r.createdAt = u.getCreatedAt();
        return r;
    }
}
