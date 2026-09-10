package kz.iitu.adaptivelearning.repository;
import kz.iitu.adaptivelearning.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface QuizRepository extends JpaRepository<Quiz, Long> { List<Quiz> findByTopicIdOrderByDifficultyAsc(Long topicId); }
