package kz.iitu.adaptivelearning.service;

import kz.iitu.adaptivelearning.dto.LearningDtos.*;
import kz.iitu.adaptivelearning.entity.*;
import kz.iitu.adaptivelearning.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
@Transactional
public class QuizService {
    private final QuizRepository quizzes; private final QuizAttemptRepository attempts; private final TopicProgressRepository progress; private final CurrentUserService current; private final AdaptiveLearningService adaptive;
    public QuizService(QuizRepository quizzes, QuizAttemptRepository attempts, TopicProgressRepository progress, CurrentUserService current, AdaptiveLearningService adaptive) { this.quizzes=quizzes; this.attempts=attempts; this.progress=progress; this.current=current; this.adaptive=adaptive; }

    public QuizView getRecommendedQuiz(Long topicId) {
        User user=current.requireUser();
        Difficulty target=progress.findByUserIdAndTopicId(user.getId(),topicId).map(TopicProgress::getCurrentDifficulty).orElse(Difficulty.EASY);
        List<Quiz> list=quizzes.findByTopicIdOrderByDifficultyAsc(topicId);
        Quiz q=list.stream().filter(x -> x.getDifficulty()==target).findFirst().orElseGet(() -> list.stream().findFirst().orElseThrow(() -> new NoSuchElementException("Quiz not found")));
        List<QuestionView> qs=q.getQuestions().stream().map(x -> new QuestionView(x.getId(),x.getText(),Map.of("A",x.getOptionA(),"B",x.getOptionB(),"C",x.getOptionC(),"D",x.getOptionD()))).toList();
        return new QuizView(q.getId(),topicId,q.getTitle(),q.getDifficulty().name(),qs);
    }

    public QuizResult submit(Long quizId, QuizSubmitRequest req) {
        User user=current.requireUser(); Quiz q=quizzes.findById(quizId).orElseThrow(() -> new NoSuchElementException("Quiz not found"));
        int total=q.getQuestions().size(); int correct=0;
        for (Question question:q.getQuestions()) {
            String answer=req.answers()==null?null:req.answers().get(question.getId());
            if (answer!=null && question.getCorrectOption().equalsIgnoreCase(answer.trim())) correct++;
        }
        int score=total==0?0:(int)Math.round(correct*100.0/total);
        QuizAttempt a=new QuizAttempt(); a.setUser(user); a.setQuiz(q); a.setScore(score); a.setCorrectAnswers(correct); a.setTotalQuestions(total); attempts.save(a);
        AdaptiveLearningService.Adaptation ad=adaptive.adapt(user,q.getTopic(),score);
        return new QuizResult(score,correct,total,ad.difficulty().name(),ad.status().name(),ad.recommendation());
    }
}
