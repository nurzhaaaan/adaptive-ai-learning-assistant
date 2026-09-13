package kz.iitu.adaptivelearning.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import kz.iitu.adaptivelearning.entity.TopicProgress;

public interface TopicProgressRepository
        extends JpaRepository<TopicProgress, Long> {

    Optional<TopicProgress>
    findByUserIdAndTopicId(
            Long userId,
            Long topicId
    );

    List<TopicProgress>
    findByUserId(
            Long userId
    );

    List<TopicProgress>
    findByUserIdOrderByMasteryScoreAsc(
            Long userId
    );
}