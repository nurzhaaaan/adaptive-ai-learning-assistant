package kz.iitu.adaptivelearning.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import kz.iitu.adaptivelearning.entity.Recommendation;

public interface RecommendationRepository
        extends JpaRepository<Recommendation, Long> {

    List<Recommendation>
    findTop5ByUserIdOrderByCreatedAtDesc(
            Long userId
    );

    Optional<Recommendation>
    findTop1ByUserIdOrderByCreatedAtDesc(
            Long userId
    );
}