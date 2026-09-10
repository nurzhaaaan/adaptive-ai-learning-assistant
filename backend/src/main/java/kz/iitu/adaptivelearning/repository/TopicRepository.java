package kz.iitu.adaptivelearning.repository;
import kz.iitu.adaptivelearning.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface TopicRepository extends JpaRepository<Topic, Long> { List<Topic> findByCourseIdOrderByOrderNumberAsc(Long courseId); }
