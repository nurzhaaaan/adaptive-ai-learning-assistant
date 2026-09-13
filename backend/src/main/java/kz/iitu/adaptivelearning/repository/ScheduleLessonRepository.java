package kz.iitu.adaptivelearning.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import kz.iitu.adaptivelearning.entity.ScheduleLesson;

public interface ScheduleLessonRepository
        extends JpaRepository<ScheduleLesson, Long> {

    List<ScheduleLesson>
    findAllByUserIdOrderByDayIndexAscStartTimeAsc(
            Long userId
    );

    Optional<ScheduleLesson>
    findByIdAndUserId(
            Long id,
            Long userId
    );
}