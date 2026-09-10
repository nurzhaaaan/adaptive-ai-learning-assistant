package kz.iitu.adaptivelearning.service;

import kz.iitu.adaptivelearning.dto.LearningDtos.*;
import kz.iitu.adaptivelearning.entity.*;
import kz.iitu.adaptivelearning.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
@Transactional
public class DiagnosticService {
    private final CourseRepository courses; private final TopicRepository topics; private final QuizRepository quizzes; private final CurrentUserService current; private final AdaptiveLearningService adaptive;
    public DiagnosticService(CourseRepository courses, TopicRepository topics, QuizRepository quizzes, CurrentUserService current, AdaptiveLearningService adaptive) { this.courses=courses; this.topics=topics; this.quizzes=quizzes; this.current=current; this.adaptive=adaptive; }

    public DiagnosticView get(Long courseId) {
        Course c=courses.findById(courseId).orElseThrow(() -> new NoSuchElementException("Course not found"));
        List<DiagnosticQuestion> out=new ArrayList<>();
        for (Topic t:topics.findByCourseIdOrderByOrderNumberAsc(courseId)) {
            Quiz q=quizzes.findByTopicIdOrderByDifficultyAsc(t.getId()).stream().filter(x -> x.getDifficulty()==Difficulty.EASY).findFirst().orElse(null);
            if (q==null) continue;
            q.getQuestions().stream().limit(2).forEach(x -> out.add(new DiagnosticQuestion(x.getId(),t.getId(),t.getTitle(),x.getText(),Map.of("A",x.getOptionA(),"B",x.getOptionB(),"C",x.getOptionC(),"D",x.getOptionD()))));
        }
        return new DiagnosticView(c.getId(),c.getTitle(),out);
    }

    public DiagnosticResult submit(Long courseId, DiagnosticSubmitRequest request) {
        User user=current.requireUser(); DiagnosticView view=get(courseId);
        Map<Long,List<DiagnosticQuestion>> byTopic=new LinkedHashMap<>();
        for (DiagnosticQuestion q:view.questions()) byTopic.computeIfAbsent(q.topicId(),k->new ArrayList<>()).add(q);
        List<WeakTopic> results=new ArrayList<>(); int totalCorrect=0,total=0;
        for (var entry:byTopic.entrySet()) {
            Topic topic=topics.findById(entry.getKey()).orElseThrow(); int correct=0;
            Quiz easy=quizzes.findByTopicIdOrderByDifficultyAsc(topic.getId()).stream().filter(x->x.getDifficulty()==Difficulty.EASY).findFirst().orElseThrow();
            Map<Long,String> correctMap=new HashMap<>(); easy.getQuestions().forEach(q->correctMap.put(q.getId(),q.getCorrectOption()));
            for (DiagnosticQuestion q:entry.getValue()) { total++; String a=request.answers()==null?null:request.answers().get(q.questionId()); if(a!=null&&a.equalsIgnoreCase(correctMap.get(q.questionId()))) {correct++; totalCorrect++;} }
            int score=(int)Math.round(correct*100.0/Math.max(1,entry.getValue().size())); adaptive.adapt(user,topic,score); results.add(new WeakTopic(topic.getId(),topic.getTitle(),score));
        }
        int overall=(int)Math.round(totalCorrect*100.0/Math.max(1,total)); String level=overall<50?"BEGINNER":overall<80?"INTERMEDIATE":"ADVANCED";
        return new DiagnosticResult(overall,level,results,"Diagnostic completed. Your starting learning path has been personalized automatically.");
    }
}
