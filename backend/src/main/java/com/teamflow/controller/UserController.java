package com.teamflow.controller;

import com.teamflow.dto.UserRequest;
import com.teamflow.dto.UserResponse;
import com.teamflow.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAll() {
        return ResponseEntity.ok(userService.getAll());
    }

    @GetMapping("/assignees")
    public ResponseEntity<List<UserResponse>> getAssignableUsers() {
        return ResponseEntity.ok(userService.getAssignableUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getById(id));
    }

    @PostMapping
    public ResponseEntity<UserResponse> create(@Valid @RequestBody UserRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.create(req));
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<UserResponse> deactivate(@PathVariable Long id) {
        return ResponseEntity.ok(userService.deactivate(id));
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<UserResponse> activate(@PathVariable Long id) {
        return ResponseEntity.ok(userService.activate(id));
    }

    @GetMapping("/admins")
    public ResponseEntity<List<UserResponse>> getAllAdmins() {
        return ResponseEntity.ok(userService.getAllAdmins());
    }

    @PatchMapping("/admins/activate-all")
    public ResponseEntity<List<UserResponse>> activateAllAdmins() {
        return ResponseEntity.ok(userService.activateAllAdmins());
    }
}
