package kz.iitu.adaptivelearning.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import kz.iitu.adaptivelearning.dto.AdminDtos.*;
import kz.iitu.adaptivelearning.dto.AdminDtos.AdminQuizAttempt;
import kz.iitu.adaptivelearning.dto.AdminDtos.AdminRecommendation;
import kz.iitu.adaptivelearning.dto.AdminDtos.AdminSummary;
import kz.iitu.adaptivelearning.dto.AdminDtos.AdminTopicProgress;
import kz.iitu.adaptivelearning.dto.AdminDtos.StudentDetails;
import kz.iitu.adaptivelearning.dto.AdminDtos.UserView;
import kz.iitu.adaptivelearning.entity.Quiz;
import kz.iitu.adaptivelearning.entity.QuizAttempt;
import kz.iitu.adaptivelearning.entity.Recommendation;
import kz.iitu.adaptivelearning.entity.Role;
import kz.iitu.adaptivelearning.entity.Topic;
import kz.iitu.adaptivelearning.entity.TopicProgress;
import kz.iitu.adaptivelearning.entity.User;
import kz.iitu.adaptivelearning.repository.CourseRepository;
import kz.iitu.adaptivelearning.repository.QuizAttemptRepository;
import kz.iitu.adaptivelearning.repository.RecommendationRepository;
import kz.iitu.adaptivelearning.repository.TopicProgressRepository;
import kz.iitu.adaptivelearning.repository.UserRepository;

@Service
@Transactional(readOnly = true)
public class AdminService {

    private final UserRepository users;
    private final CourseRepository courses;
    private final TopicProgressRepository progress;
    private final QuizAttemptRepository attempts;
    private final RecommendationRepository recommendations;

    public AdminService(
            UserRepository users,
            CourseRepository courses,
            TopicProgressRepository progress,
            QuizAttemptRepository attempts,
            RecommendationRepository recommendations
    ) {
        this.users = users;
        this.courses = courses;
        this.progress = progress;
        this.attempts = attempts;
        this.recommendations = recommendations;
    }

    public AdminSummary getSummary() {

        return new AdminSummary(
                users.count(),
                users.countByRole(Role.STUDENT),
                users.countByRole(Role.ADMIN),
                courses.count()
        );
    }

    public List<UserView> getStudents() {

        return users
                .findAllByRoleOrderByCreatedAtDesc(
                        Role.STUDENT
                )
                .stream()
                .map(this::toView)
                .toList();
    }

    public List<UserView> getAllUsers() {

        return users
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toView)
                .toList();
    }

    public StudentDetails getStudentDetails(
            Long studentId
    ) {

        User student =
                users.findById(studentId)
                        .orElseThrow(
                                () ->
                                        new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Студент табылмады"
                                        )
                        );

        if (student.getRole() != Role.STUDENT) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Бұл қолданушы студент емес"
            );
        }

        List<TopicProgress> progressList =
                progress.findByUserId(
                        studentId
                );

        List<QuizAttempt> allAttempts =
                attempts.findByUserIdOrderByIdDesc(
                        studentId
                );

        List<QuizAttempt> recentAttempts =
                attempts.findTop10ByUserIdOrderByIdDesc(
                        studentId
                );

        List<Recommendation> recommendationList =
                recommendations
                        .findTop5ByUserIdOrderByCreatedAtDesc(
                                studentId
                        );

        int overallProgress =
                calculateOverallProgress(
                        progressList
                );

        int averageQuizScore =
                calculateAverageQuizScore(
                        allAttempts
                );

        String level =
                calculateLevel(
                        progressList,
                        overallProgress
                );

        List<String> studentCourses =
                progressList
                        .stream()
                        .map(
                                item ->
                                        item
                                                .getTopic()
                                                .getCourse()
                                                .getTitle()
                        )
                        .distinct()
                        .sorted()
                        .toList();

        List<AdminTopicProgress> topicViews =
                progressList
                        .stream()
                        .sorted(
                                (a, b) ->
                                        Integer.compare(
                                                a.getMasteryScore(),
                                                b.getMasteryScore()
                                        )
                        )
                        .map(this::toTopicProgress)
                        .toList();

        /*
         * 80%-дан төмен тақырыптарды
         * әлсіз / practice қажет деп көрсетеміз.
         */
        List<AdminTopicProgress> weakTopics =
                topicViews
                        .stream()
                        .filter(
                                item ->
                                        item.masteryScore() < 80
                        )
                        .limit(5)
                        .toList();

        List<AdminQuizAttempt> recentQuizViews =
                recentAttempts
                        .stream()
                        .map(this::toQuizAttempt)
                        .toList();

        List<AdminRecommendation> recommendationViews =
                recommendationList
                        .stream()
                        .map(this::toRecommendation)
                        .toList();

        return new StudentDetails(
                student.getId(),
                student.getName(),
                student.getUsername(),
                student.getEmail(),
                student.getRole().name(),
                student.getCreatedAt(),

                level,
                overallProgress,
                averageQuizScore,
                allAttempts.size(),

                studentCourses,
                topicViews,
                weakTopics,
                recentQuizViews,
                recommendationViews
        );
    }

    private int calculateOverallProgress(
            List<TopicProgress> progressList
    ) {

        if (progressList.isEmpty()) {
            return 0;
        }

        double average =
                progressList
                        .stream()
                        .mapToInt(
                                TopicProgress::getMasteryScore
                        )
                        .average()
                        .orElse(0);

        return (int)
                Math.round(average);
    }

    private int calculateAverageQuizScore(
            List<QuizAttempt> attempts
    ) {

        if (attempts.isEmpty()) {
            return 0;
        }

        double average =
                attempts
                        .stream()
                        .mapToInt(
                                QuizAttempt::getScore
                        )
                        .average()
                        .orElse(0);

        return (int)
                Math.round(average);
    }

    private String calculateLevel(
            List<TopicProgress> progressList,
            int overallProgress
    ) {

        if (progressList.isEmpty()) {
            return "NOT_ASSESSED";
        }

        if (overallProgress < 50) {
            return "BEGINNER";
        }

        if (overallProgress < 80) {
            return "INTERMEDIATE";
        }

        return "ADVANCED";
    }

    private AdminTopicProgress toTopicProgress(
            TopicProgress item
    ) {

        Topic topic =
                item.getTopic();

        return new AdminTopicProgress(
                topic.getId(),
                topic.getCourse().getTitle(),
                topic.getTitle(),
                item.getMasteryScore(),
                item.getCurrentDifficulty().name(),
                item.getStatus().name()
        );
    }

    private AdminQuizAttempt toQuizAttempt(
            QuizAttempt attempt
    ) {

        Quiz quiz =
                attempt.getQuiz();

        Topic topic =
                quiz.getTopic();

        return new AdminQuizAttempt(
                attempt.getId(),
                quiz.getId(),
                topic.getCourse().getTitle(),
                topic.getTitle(),
                quiz.getTitle(),
                quiz.getDifficulty().name(),
                attempt.getScore(),
                attempt.getCorrectAnswers(),
                attempt.getTotalQuestions()
        );
    }

    private AdminRecommendation toRecommendation(
            Recommendation recommendation
    ) {

        String topicTitle =
                recommendation.getTopic() == null
                        ? null
                        : recommendation
                                .getTopic()
                                .getTitle();

        return new AdminRecommendation(
                recommendation.getId(),
                recommendation.getTitle(),
                recommendation.getMessage(),
                recommendation.getType(),
                topicTitle,
                recommendation.getCreatedAt()
        );
    }

    private UserView toView(
            User user
    ) {

        return new UserView(
                user.getId(),
                user.getName(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                user.getCreatedAt()
        );
    }
}