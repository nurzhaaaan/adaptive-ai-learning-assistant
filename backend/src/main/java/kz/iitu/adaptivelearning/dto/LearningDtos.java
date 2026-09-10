package kz.iitu.adaptivelearning.dto;

import java.time.LocalDateTime;
import java.util.*;

public final class LearningDtos {
    private LearningDtos() {}

    public record CourseSummary(Long id, String code, String title, String description, int progressPercent, int topicCount) {}
    public record TopicView(Long id, String title, String content, int orderNumber, int masteryScore, String difficulty, String status) {}
    public record CourseDetails(Long id, String code, String title, String description, List<TopicView> topics) {}
    public record QuestionView(Long id, String text, Map<String,String> options) {}
    public record QuizView(Long id, Long topicId, String title, String difficulty, List<QuestionView> questions) {}
    public record QuizSubmitRequest(Map<Long,String> answers) {}
    public record QuizResult(int score, int correctAnswers, int totalQuestions, String nextDifficulty, String status, String recommendation) {}
    public record RecommendationView(Long id, String title, String message, String type, Long topicId, LocalDateTime createdAt) {}
    public record WeakTopic(Long topicId, String topicTitle, int masteryScore) {}
    public record ScorePoint(String label, int score) {}
    public record Dashboard(String studentName, int overallProgress, int averageScore, int completedQuizzes, List<CourseSummary> courses, List<WeakTopic> weakTopics, List<RecommendationView> recommendations, List<ScorePoint> scoreHistory) {}
    public record Analytics(int overallProgress, int averageScore, int masteredTopics, int reviewRequiredTopics, List<WeakTopic> topicMastery, List<ScorePoint> scoreHistory) {}
    public record DiagnosticQuestion(Long questionId, Long topicId, String topicTitle, String text, Map<String,String> options) {}
    public record DiagnosticView(Long courseId, String courseTitle, List<DiagnosticQuestion> questions) {}
    public record DiagnosticSubmitRequest(Map<Long,String> answers) {}
    public record DiagnosticResult(int overallScore, String calculatedLevel, List<WeakTopic> topicResults, String message) {}
    public record AiChatRequest(String message, Long topicId) {}
    public record AiChatResponse(String reply, String source, String studentLevel, String contextSummary) {}
}
