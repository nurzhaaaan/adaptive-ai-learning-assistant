package kz.iitu.adaptivelearning.service;

import kz.iitu.adaptivelearning.dto.LearningDtos.*;
import kz.iitu.adaptivelearning.entity.*;
import kz.iitu.adaptivelearning.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
@Transactional
public class LearningService {
    private final CourseRepository courses; private final TopicRepository topics; private final TopicProgressRepository progress; private final CurrentUserService current;
    public LearningService(CourseRepository courses, TopicRepository topics, TopicProgressRepository progress, CurrentUserService current) { this.courses=courses; this.topics=topics; this.progress=progress; this.current=current; }

    public List<CourseSummary> listCourses() {
        User user=current.requireUser();
        return courses.findAll().stream().map(c -> new CourseSummary(c.getId(),c.getCode(),c.getTitle(),c.getDescription(),courseProgress(user,c.getId()),topics.findByCourseIdOrderByOrderNumberAsc(c.getId()).size())).toList();
    }

    public CourseDetails getCourse(Long courseId) {
        User user=current.requireUser(); Course c=courses.findById(courseId).orElseThrow(() -> new NoSuchElementException("Course not found"));
        List<TopicView> tv=topics.findByCourseIdOrderByOrderNumberAsc(courseId).stream().map(t -> {
            TopicProgress p=progress.findByUserIdAndTopicId(user.getId(),t.getId()).orElse(null);
            return new TopicView(t.getId(),t.getTitle(),t.getContent(),t.getOrderNumber(),p==null?0:p.getMasteryScore(),p==null?Difficulty.EASY.name():p.getCurrentDifficulty().name(),p==null?ProgressStatus.NOT_STARTED.name():p.getStatus().name());
        }).toList();
        return new CourseDetails(c.getId(),c.getCode(),c.getTitle(),c.getDescription(),tv);
    }

    private int courseProgress(User user, Long courseId) {
        List<Topic> ts=topics.findByCourseIdOrderByOrderNumberAsc(courseId); if (ts.isEmpty()) return 0;
        int sum=ts.stream().mapToInt(t -> progress.findByUserIdAndTopicId(user.getId(),t.getId()).map(TopicProgress::getMasteryScore).orElse(0)).sum();
        return sum/ts.size();
    }
}
