package kz.iitu.adaptivelearning.repository;
import kz.iitu.adaptivelearning.entity.Recommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface RecommendationRepository extends JpaRepository<Recommendation, Long> { List<Recommendation> findTop5ByUserIdOrderByCreatedAtDesc(Long userId); }
