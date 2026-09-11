package kz.iitu.adaptivelearning.service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import kz.iitu.adaptivelearning.dto.LearningDtos.*;
import kz.iitu.adaptivelearning.dto.LearningDtos.AiChatRequest;
import kz.iitu.adaptivelearning.dto.LearningDtos.AiChatResponse;
import kz.iitu.adaptivelearning.entity.Difficulty;
import kz.iitu.adaptivelearning.entity.Topic;
import kz.iitu.adaptivelearning.entity.TopicProgress;
import kz.iitu.adaptivelearning.entity.User;
import kz.iitu.adaptivelearning.repository.TopicProgressRepository;
import kz.iitu.adaptivelearning.repository.TopicRepository;

@Service
@Transactional
public class AiTutorService {

    private final CurrentUserService current;
    private final TopicRepository topics;
    private final TopicProgressRepository progress;
    private final ObjectMapper mapper;

    @Value("${app.ai.api-url:}")
    private String apiUrl;

    @Value("${app.ai.api-key:}")
    private String apiKey;

    @Value("${app.ai.model:}")
    private String model;

    public AiTutorService(
            CurrentUserService current,
            TopicRepository topics,
            TopicProgressRepository progress,
            ObjectMapper mapper
    ) {
        this.current = current;
        this.topics = topics;
        this.progress = progress;
        this.mapper = mapper;
    }

    public AiChatResponse chat(AiChatRequest req) {

        User user = current.requireUser();

        String userMessage =
                req.message() == null || req.message().isBlank()
                        ? "Explain what I should study next."
                        : req.message().trim();

        Topic selectedTopic =
                req.topicId() == null
                        ? null
                        : topics.findById(req.topicId())
                        .orElse(null);

        List<TopicProgress> allProgress =
                progress.findByUserId(user.getId());

        TopicProgress selectedProgress = null;

        if (selectedTopic != null) {
            selectedProgress =
                    progress
                            .findByUserIdAndTopicId(
                                    user.getId(),
                                    selectedTopic.getId()
                            )
                            .orElse(null);
        }

        int selectedScore =
                selectedProgress == null
                        ? 0
                        : selectedProgress.getMasteryScore();

        int averageScore = calculateAverage(allProgress);

        int effectiveScore =
                selectedTopic != null
                        ? selectedScore
                        : averageScore;

        String level = calculateLevel(effectiveScore);

        Difficulty difficulty =
                selectedProgress != null
                        ? selectedProgress.getCurrentDifficulty()
                        : calculateDifficulty(effectiveScore);

        List<TopicProgress> weakProgress =
                allProgress.stream()
                        .filter(p ->
                                p.getMasteryScore() != null
                                        && p.getMasteryScore() < 50
                        )
                        .sorted(
                                Comparator.comparingInt(
                                        TopicProgress::getMasteryScore
                                )
                        )
                        .toList();

        String weakTopics =
                weakProgress.isEmpty()
                        ? "No weak topics detected"
                        : weakProgress.stream()
                        .map(p ->
                                p.getTopic().getTitle()
                                        + " ("
                                        + p.getMasteryScore()
                                        + "%)"
                        )
                        .collect(Collectors.joining(", "));

        String contextSummary =
                buildContextSummary(
                        selectedTopic,
                        effectiveScore,
                        level,
                        difficulty,
                        averageScore,
                        weakTopics
                );

        /*
         * External LLM is used only when API credentials
         * are configured.
         */
        if (
                apiUrl != null
                        && !apiUrl.isBlank()
                        && apiKey != null
                        && !apiKey.isBlank()
        ) {
            try {
                String reply =
                        callExternal(
                                userMessage,
                                selectedTopic,
                                level,
                                effectiveScore,
                                difficulty,
                                weakTopics,
                                averageScore
                        );

                if (
                        reply != null
                                && !reply.isBlank()
                ) {
                    return new AiChatResponse(
                            reply,
                            "external-llm",
                            level,
                            contextSummary
                    );
                }

            } catch (Exception exception) {
                System.err.println(
                        "External AI error: "
                                + exception.getMessage()
                );
            }
        }

        /*
         * Built-in adaptive tutor fallback.
         * Works even without external AI API.
         */
        String reply =
                buildAdaptiveFallback(
                        userMessage,
                        selectedTopic,
                        effectiveScore,
                        level,
                        difficulty,
                        weakTopics,
                        averageScore
                );

        return new AiChatResponse(
                reply,
                "built-in-adaptive-tutor",
                level,
                contextSummary
        );
    }

    private int calculateAverage(
            List<TopicProgress> progressList
    ) {

        if (
                progressList == null
                        || progressList.isEmpty()
        ) {
            return 0;
        }

        return (int) Math.round(
                progressList.stream()
                        .mapToInt(p ->
                                p.getMasteryScore() == null
                                        ? 0
                                        : p.getMasteryScore()
                        )
                        .average()
                        .orElse(0)
        );
    }

    private String calculateLevel(int score) {

        if (score < 50) {
            return "Beginner";
        }

        if (score < 80) {
            return "Intermediate";
        }

        return "Advanced";
    }

    private Difficulty calculateDifficulty(int score) {

        if (score < 50) {
            return Difficulty.EASY;
        }

        if (score < 80) {
            return Difficulty.MEDIUM;
        }

        return Difficulty.HARD;
    }

    private String buildContextSummary(
            Topic topic,
            int score,
            String level,
            Difficulty difficulty,
            int averageScore,
            String weakTopics
    ) {

        String currentTopic =
                topic == null
                        ? "General learning support"
                        : topic.getTitle();

        String course =
                topic == null
                        ? "All courses"
                        : topic.getCourse().getTitle();

        return "Course: "
                + course
                + "; Topic: "
                + currentTopic
                + "; Mastery: "
                + score
                + "%; Level: "
                + level
                + "; Difficulty: "
                + difficulty
                + "; Overall average: "
                + averageScore
                + "%; Weak topics: "
                + weakTopics;
    }

    private String buildAdaptiveFallback(
            String message,
            Topic topic,
            int score,
            String level,
            Difficulty difficulty,
            String weakTopics,
            int averageScore
    ) {

        if (topic == null) {

            if (weakTopics.equals(
                    "No weak topics detected"
            )) {
                return """
                        Your current learning profile is %s with an average mastery of %d%%.

                        I do not see any topics below 50%% right now.

                        Continue practicing your current subjects and take adaptive quizzes so I can update your learning path.

                        Recommended strategy:
                        1. Review your latest material.
                        2. Complete the recommended quiz.
                        3. Check Progress & Analytics.
                        4. Return to AI Tutor for the next recommendation.
                        """.formatted(
                        level,
                        averageScore
                );
            }

            return """
                    Based on your learning progress, your current overall level is %s and your average mastery is %d%%.

                    Your weakest areas are:
                    %s

                    I recommend starting with the weakest topic first.

                    Study the basic explanation, look at one simple example, and then take the EASY adaptive quiz.

                    When your score improves, the system will automatically increase the difficulty.
                    """.formatted(
                    level,
                    averageScore,
                    weakTopics
            );
        }

        String content =
                topic.getContent() == null
                        ? ""
                        : topic.getContent();

        String shortContent =
                content.length() > 700
                        ? content.substring(0, 700) + "..."
                        : content;

        if (score < 50) {

            return """
                    You are currently at %s level for %s.

                    Current mastery: %d%%
                    Adaptive difficulty: %s

                    Let's start from the fundamentals.

                    %s

                    Focus on understanding the basic definition first. Then try one small practical example.

                    Your current weak-topic profile is:
                    %s

                    After reviewing this topic, take the EASY quiz. If your score improves, the adaptive engine will increase your next difficulty automatically.
                    """.formatted(
                    level,
                    topic.getTitle(),
                    score,
                    difficulty,
                    shortContent,
                    weakTopics
            );
        }

        if (score < 80) {

            return """
                    You are currently at %s level for %s.

                    Current mastery: %d%%
                    Adaptive difficulty: %s

                    You already understand the fundamentals, so let's focus on practical application.

                    %s

                    Try connecting this concept to a real code example and explain why it works.

                    Your weaker areas are:
                    %s

                    Next step: complete a MEDIUM quiz to strengthen your mastery.
                    """.formatted(
                    level,
                    topic.getTitle(),
                    score,
                    difficulty,
                    shortContent,
                    weakTopics
            );
        }

        return """
                You are currently at %s level for %s.

                Current mastery: %d%%
                Adaptive difficulty: %s

                You have a strong foundation in this topic.

                %s

                Instead of repeating the basics, try solving a harder application problem, comparing alternative approaches, or explaining the concept in your own words.

                Your current weak-topic profile is:
                %s

                Next step: challenge yourself with a HARD adaptive quiz.
                """.formatted(
                level,
                topic.getTitle(),
                score,
                difficulty,
                shortContent,
                weakTopics
        );
    }

    private String callExternal(
            String message,
            Topic topic,
            String level,
            int score,
            Difficulty difficulty,
            String weakTopics,
            int averageScore
    ) throws Exception {

        String topicContext =
                topic == null
                        ? "The student did not select a specific topic."
                        : """
                        Current course: %s
                        Current topic: %s
                        Course material:
                        %s
                        """.formatted(
                        topic.getCourse().getTitle(),
                        topic.getTitle(),
                        topic.getContent()
                );

        String systemPrompt = """
                You are an AI-based adaptive learning assistant for university students.

                Your task is not only to answer questions.
                You must adapt your explanation to the student's current learning profile.

                Student profile:
                - Current level: %s
                - Current mastery score: %d%%
                - Overall average mastery: %d%%
                - Adaptive difficulty: %s
                - Weak topics: %s

                Adaptive rules:
                - Below 50%% = Beginner, EASY difficulty, explain fundamentals simply.
                - 50%% to 79%% = Intermediate, MEDIUM difficulty, use practical examples.
                - 80%% and above = Advanced, HARD difficulty, use challenging explanations and application tasks.

                %s

                Instructions:
                - Answer clearly and concisely.
                - Adapt vocabulary and difficulty to the student.
                - Use the provided course material when relevant.
                - If the student is weak in a topic, recommend reviewing fundamentals.
                - If mastery is high, avoid over-explaining basic ideas.
                - End with one useful next learning step.
                """.formatted(
                level,
                score,
                averageScore,
                difficulty,
                weakTopics,
                topicContext
        );

        String selectedModel =
                model == null || model.isBlank()
                        ? "gpt-5-mini"
                        : model;

        Map<String, Object> body =
                Map.of(
                        "model",
                        selectedModel,
                        "messages",
                        List.of(
                                Map.of(
                                        "role",
                                        "system",
                                        "content",
                                        systemPrompt
                                ),
                                Map.of(
                                        "role",
                                        "user",
                                        "content",
                                        message
                                )
                        )
                );

        HttpRequest request =
                HttpRequest
                        .newBuilder(
                                URI.create(apiUrl)
                        )
                        .header(
                                "Authorization",
                                "Bearer " + apiKey
                        )
                        .header(
                                "Content-Type",
                                "application/json"
                        )
                        .POST(
                                HttpRequest.BodyPublishers
                                        .ofString(
                                                mapper.writeValueAsString(
                                                        body
                                                )
                                        )
                        )
                        .build();

        HttpResponse<String> response =
                HttpClient
                        .newHttpClient()
                        .send(
                                request,
                                HttpResponse.BodyHandlers
                                        .ofString()
                        );

        if (
                response.statusCode() < 200
                        || response.statusCode() >= 300
        ) {
            throw new IllegalStateException(
                    "AI API returned HTTP "
                            + response.statusCode()
            );
        }

        JsonNode json =
                mapper.readTree(
                        response.body()
                );

        return json
                .path("choices")
                .path(0)
                .path("message")
                .path("content")
                .asText("");
    }
}