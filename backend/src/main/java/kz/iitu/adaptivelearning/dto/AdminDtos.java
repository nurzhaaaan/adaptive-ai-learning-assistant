package kz.iitu.adaptivelearning.dto;

import java.time.LocalDateTime;
import java.util.List;

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

    public record AdminTopicProgress(
            Long topicId,
            String courseTitle,
            String topicTitle,
            int masteryScore,
            String difficulty,
            String status
    ) {}

    public record AdminQuizAttempt(
            Long id,
            Long quizId,
            String courseTitle,
            String topicTitle,
            String quizTitle,
            String difficulty,
            int score,
            int correctAnswers,
            int totalQuestions
    ) {}

    public record AdminRecommendation(
            Long id,
            String title,
            String message,
            String type,
            String topicTitle,
            LocalDateTime createdAt
    ) {}

    public record StudentDetails(
            Long id,
            String name,
            String username,
            String email,
            String role,
            LocalDateTime createdAt,

            String level,
            int overallProgress,
            int averageQuizScore,
            long completedQuizzes,

            List<String> courses,
            List<AdminTopicProgress> topicProgress,
            List<AdminTopicProgress> weakTopics,
            List<AdminQuizAttempt> recentQuizzes,
            List<AdminRecommendation> recommendations
    ) {}
}