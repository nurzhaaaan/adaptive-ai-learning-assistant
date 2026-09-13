package kz.iitu.adaptivelearning.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import kz.iitu.adaptivelearning.entity.QuizAttempt;

public interface QuizAttemptRepository
        extends JpaRepository<QuizAttempt, Long> {

    /*
     * Existing AnalyticsService methods
     */
    List<QuizAttempt> findByUserId(
            Long userId
    );

    List<QuizAttempt> findTop20ByUserIdOrderByCompletedAtDesc(
            Long userId
    );

    /*
     * Admin student analytics methods
     */
    List<QuizAttempt> findByUserIdOrderByIdDesc(
            Long userId
    );

    List<QuizAttempt> findTop10ByUserIdOrderByIdDesc(
            Long userId
    );

    long countByUserId(
            Long userId
    );
}