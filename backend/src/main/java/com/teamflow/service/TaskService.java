package com.teamflow.service;

import com.teamflow.dto.TaskRequest;
import com.teamflow.dto.TaskResponse;
import com.teamflow.entity.Task;
import com.teamflow.entity.User;
import com.teamflow.repository.TaskRepository;
import com.teamflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepo;
    private final UserRepository userRepo;

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    public List<TaskResponse> getAll(String status, Long assignedTo) {
        Task.Status statusEnum = null;
        if (status != null && !status.isBlank()) {
            try {
                statusEnum = Task.Status.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status: " + status);
            }
        }
        return taskRepo.findWithFilters(statusEnum, assignedTo)
                .stream()
                .map(TaskResponse::from)
                .toList();
    }

    public TaskResponse getById(Long id) {
        Task task = taskRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
        return TaskResponse.from(task);
    }

    public TaskResponse create(TaskRequest req) {
        User creator = currentUser();

        Task.Status status;
        try {
            status = Task.Status.valueOf(req.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            status = Task.Status.TODO;
        }

        User assignedTo = null;
        if (req.getAssignedToId() != null) {
            assignedTo = userRepo.findById(req.getAssignedToId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assigned user not found"));
        }

        Task task = Task.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .status(status)
                .assignedTo(assignedTo)
                .createdBy(creator)
                .build();

        return TaskResponse.from(taskRepo.save(task));
    }

    public TaskResponse update(Long id, TaskRequest req) {
        Task task = taskRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));

        User current = currentUser();
        boolean isAdmin = current.getRole() == User.Role.ADMIN;
        boolean isCreator = task.getCreatedBy().getId().equals(current.getId());
        boolean isAssignee = task.getAssignedTo() != null
                && task.getAssignedTo().getId().equals(current.getId());

        if (!isAdmin && !isCreator && !isAssignee) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You do not have permission to update this task");
        }

        Task.Status status;
        try {
            status = Task.Status.valueOf(req.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status: " + req.getStatus());
        }

        User assignedTo = null;
        if (req.getAssignedToId() != null) {
            assignedTo = userRepo.findById(req.getAssignedToId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assigned user not found"));
        }

        task.setTitle(req.getTitle());
        task.setDescription(req.getDescription());
        task.setStatus(status);
        task.setAssignedTo(assignedTo);

        return TaskResponse.from(taskRepo.save(task));
    }

    public void delete(Long id) {
        Task task = taskRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));

        User current = currentUser();
        boolean isAdmin = current.getRole() == User.Role.ADMIN;
        boolean isCreator = task.getCreatedBy().getId().equals(current.getId());

        if (!isAdmin && !isCreator) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Only the task creator or an admin can delete this task");
        }

        taskRepo.delete(task);
    }
}
