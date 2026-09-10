package kz.iitu.adaptivelearning.controller;
import kz.iitu.adaptivelearning.dto.LearningDtos.*;
import kz.iitu.adaptivelearning.service.QuizService;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/quizzes")
public class QuizController {
 private final QuizService quizzes; public QuizController(QuizService quizzes){this.quizzes=quizzes;}
 @GetMapping("/topic/{topicId}") public QuizView getRecommended(@PathVariable Long topicId){return quizzes.getRecommendedQuiz(topicId);} 
 @PostMapping("/{quizId}/submit") public QuizResult submit(@PathVariable Long quizId,@RequestBody QuizSubmitRequest request){return quizzes.submit(quizId,request);} 
}
