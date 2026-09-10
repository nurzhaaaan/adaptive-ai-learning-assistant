package kz.iitu.adaptivelearning.service;

import kz.iitu.adaptivelearning.entity.*;
import kz.iitu.adaptivelearning.repository.*;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class AdaptiveLearningService {
    private final TopicProgressRepository progressRepo; private final RecommendationRepository recRepo;
    public AdaptiveLearningService(TopicProgressRepository progressRepo, RecommendationRepository recRepo) { this.progressRepo=progressRepo; this.recRepo=recRepo; }

    public Adaptation adapt(User user, Topic topic, int score) {
        Difficulty difficulty; ProgressStatus status; String title; String message; String type;
        if (score < 50) { difficulty=Difficulty.EASY; status=ProgressStatus.REVIEW_REQUIRED; title="Review recommended"; message="Your score is "+score+"%. Review "+topic.getTitle()+" basics and try an easier quiz before continuing."; type="REVIEW"; }
        else if (score < 80) { difficulty=Difficulty.MEDIUM; status=ProgressStatus.IN_PROGRESS; title="Keep practicing"; message="You scored "+score+"%. Continue practicing "+topic.getTitle()+" with medium-difficulty questions."; type="PRACTICE"; }
        else { difficulty=Difficulty.HARD; status=ProgressStatus.MASTERED; title="Ready to advance"; message="Great work: "+score+"%. You have mastered "+topic.getTitle()+" and can continue to the next topic or try a hard quiz."; type="ADVANCE"; }
        TopicProgress p=progressRepo.findByUserIdAndTopicId(user.getId(),topic.getId()).orElseGet(TopicProgress::new);
        p.setUser(user); p.setTopic(topic); p.setMasteryScore(score); p.setCurrentDifficulty(difficulty); p.setStatus(status); p.setUpdatedAt(LocalDateTime.now()); progressRepo.save(p);
        Recommendation r=new Recommendation(); r.setUser(user); r.setTopic(topic); r.setTitle(title); r.setMessage(message); r.setType(type); recRepo.save(r);
        return new Adaptation(difficulty,status,message);
    }
    public record Adaptation(Difficulty difficulty, ProgressStatus status, String recommendation) {}
}
