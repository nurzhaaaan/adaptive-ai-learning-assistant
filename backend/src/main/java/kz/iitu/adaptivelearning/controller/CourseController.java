package kz.iitu.adaptivelearning.controller;
import kz.iitu.adaptivelearning.dto.LearningDtos.*;
import kz.iitu.adaptivelearning.service.LearningService;
import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestController @RequestMapping("/api/courses")
public class CourseController {
 private final LearningService learning; public CourseController(LearningService learning){this.learning=learning;}
 @GetMapping public List<CourseSummary> list(){return learning.listCourses();}
 @GetMapping("/{id}") public CourseDetails get(@PathVariable Long id){return learning.getCourse(id);} 
}
