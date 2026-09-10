package kz.iitu.adaptivelearning.service;

import kz.iitu.adaptivelearning.dto.LearningDtos.*;
import kz.iitu.adaptivelearning.entity.*;
import kz.iitu.adaptivelearning.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
@Transactional
public class AnalyticsService {
    private final CurrentUserService current; private final TopicProgressRepository progress; private final QuizAttemptRepository attempts; private final RecommendationRepository recs; private final LearningService learning;
    public AnalyticsService(CurrentUserService current, TopicProgressRepository progress, QuizAttemptRepository attempts, RecommendationRepository recs, LearningService learning) { this.current=current; this.progress=progress; this.attempts=attempts; this.recs=recs; this.learning=learning; }

    public Dashboard dashboard() {
        User u=current.requireUser(); List<TopicProgress> ps=progress.findByUserId(u.getId()); List<QuizAttempt> as=attempts.findByUserId(u.getId());
        int overall=ps.isEmpty()?0:(int)Math.round(ps.stream().mapToInt(TopicProgress::getMasteryScore).average().orElse(0));
        int avg=as.isEmpty()?0:(int)Math.round(as.stream().mapToInt(QuizAttempt::getScore).average().orElse(0));
        List<WeakTopic> weak=ps.stream().filter(p -> p.getMasteryScore()<70).sorted(Comparator.comparingInt(TopicProgress::getMasteryScore)).limit(5).map(p -> new WeakTopic(p.getTopic().getId(),p.getTopic().getTitle(),p.getMasteryScore())).toList();
        List<RecommendationView> rv=recs.findTop5ByUserIdOrderByCreatedAtDesc(u.getId()).stream().map(r -> new RecommendationView(r.getId(),r.getTitle(),r.getMessage(),r.getType(),r.getTopic()==null?null:r.getTopic().getId(),r.getCreatedAt())).toList();
        List<ScorePoint> history=attempts.findTop20ByUserIdOrderByCompletedAtDesc(u.getId()).stream().sorted(Comparator.comparing(QuizAttempt::getCompletedAt)).map(a -> new ScorePoint(a.getQuiz().getTopic().getTitle(),a.getScore())).toList();
        return new Dashboard(u.getName(),overall,avg,as.size(),learning.listCourses(),weak,rv,history);
    }

    public Analytics overview() {
        User u=current.requireUser(); List<TopicProgress> ps=progress.findByUserId(u.getId()); List<QuizAttempt> as=attempts.findByUserId(u.getId());
        int overall=ps.isEmpty()?0:(int)Math.round(ps.stream().mapToInt(TopicProgress::getMasteryScore).average().orElse(0));
        int avg=as.isEmpty()?0:(int)Math.round(as.stream().mapToInt(QuizAttempt::getScore).average().orElse(0));
        int mastered=(int)ps.stream().filter(p -> p.getStatus()==ProgressStatus.MASTERED).count();
        int review=(int)ps.stream().filter(p -> p.getStatus()==ProgressStatus.REVIEW_REQUIRED).count();
        List<WeakTopic> mastery=ps.stream().sorted(Comparator.comparing(p -> p.getTopic().getOrderNumber())).map(p -> new WeakTopic(p.getTopic().getId(),p.getTopic().getTitle(),p.getMasteryScore())).toList();
        List<ScorePoint> history=attempts.findTop20ByUserIdOrderByCompletedAtDesc(u.getId()).stream().sorted(Comparator.comparing(QuizAttempt::getCompletedAt)).map(a -> new ScorePoint(a.getQuiz().getTopic().getTitle(),a.getScore())).toList();
        return new Analytics(overall,avg,mastered,review,mastery,history);
    }
}
