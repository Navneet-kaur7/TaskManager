package com.teamflow.dto;

import com.teamflow.entity.Task;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TaskResponse {
    private Long id;
    private String title;
    private String description;
    private String status;
    private UserRef assignedTo;
    private UserRef createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    public static class UserRef {
        private Long id;
        private String name;
    }

    public static TaskResponse from(Task t) {
        TaskResponse r = new TaskResponse();
        r.id = t.getId();
        r.title = t.getTitle();
        r.description = t.getDescription();
        r.status = t.getStatus().name();
        r.createdAt = t.getCreatedAt();
        r.updatedAt = t.getUpdatedAt();

        if (t.getAssignedTo() != null) {
            r.assignedTo = new UserRef();
            r.assignedTo.id = t.getAssignedTo().getId();
            r.assignedTo.name = t.getAssignedTo().getName();
        }
        if (t.getCreatedBy() != null) {
            r.createdBy = new UserRef();
            r.createdBy.id = t.getCreatedBy().getId();
            r.createdBy.name = t.getCreatedBy().getName();
        }
        return r;
    }
}
