package kz.iitu.adaptivelearning.repository;
import kz.iitu.adaptivelearning.entity.TopicProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface TopicProgressRepository extends JpaRepository<TopicProgress, Long> { Optional<TopicProgress> findByUserIdAndTopicId(Long userId, Long topicId); List<TopicProgress> findByUserId(Long userId); }
