package kz.iitu.adaptivelearning.repository;
import kz.iitu.adaptivelearning.entity.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> { List<QuizAttempt> findTop20ByUserIdOrderByCompletedAtDesc(Long userId); List<QuizAttempt> findByUserId(Long userId); }
