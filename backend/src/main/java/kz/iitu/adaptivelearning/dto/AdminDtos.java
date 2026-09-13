package kz.iitu.adaptivelearning.dto;

import java.time.LocalDateTime;

public final class AdminDtos {

    private AdminDtos() {}

    public record AdminSummary(
            long totalUsers,
            long totalStudents,
            long totalAdmins,
            long totalCourses
    ) {}

    public record UserView(
            Long id,
            String name,
            String username,
            String email,
            String role,
            LocalDateTime createdAt
    ) {}
}