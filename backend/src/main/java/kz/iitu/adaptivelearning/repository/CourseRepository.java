package kz.iitu.adaptivelearning.repository;
import kz.iitu.adaptivelearning.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface CourseRepository extends JpaRepository<Course, Long> { Optional<Course> findByCode(String code); }
