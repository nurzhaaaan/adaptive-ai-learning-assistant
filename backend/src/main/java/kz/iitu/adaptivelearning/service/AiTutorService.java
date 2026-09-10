package kz.iitu.adaptivelearning.service;

import com.fasterxml.jackson.databind.*;
import kz.iitu.adaptivelearning.dto.LearningDtos.*;
import kz.iitu.adaptivelearning.entity.*;
import kz.iitu.adaptivelearning.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.net.URI;
import java.net.http.*;
import java.util.*;

@Service
@Transactional
public class AiTutorService {
    private final CurrentUserService current; private final TopicRepository topics; private final TopicProgressRepository progress; private final ObjectMapper mapper;
    @Value("${app.ai.api-url:}") private String apiUrl;
    @Value("${app.ai.api-key:}") private String apiKey;
    @Value("${app.ai.model:}") private String model;

    public AiTutorService(CurrentUserService current, TopicRepository topics, TopicProgressRepository progress, ObjectMapper mapper) { this.current=current; this.topics=topics; this.progress=progress; this.mapper=mapper; }

    public AiChatResponse chat(AiChatRequest req) {
        User u=current.requireUser(); Topic t=req.topicId()==null?null:topics.findById(req.topicId()).orElse(null);
        TopicProgress p=t==null?null:progress.findByUserIdAndTopicId(u.getId(),t.getId()).orElse(null);
        int score=p==null?0:p.getMasteryScore(); String level=score<50?"Beginner":score<80?"Intermediate":"Advanced";
        String context=t==null?"General study support":"Course: "+t.getCourse().getTitle()+"; Topic: "+t.getTitle()+"; Mastery: "+score+"%; Level: "+level;
        if (apiUrl!=null&&!apiUrl.isBlank()&&apiKey!=null&&!apiKey.isBlank()) {
            try { String reply=callExternal(req.message(),t,level,score); return new AiChatResponse(reply,"external-llm",level,context); } catch(Exception ignored) {}
        }
        String topic=t==null?"your current subject":t.getTitle();
        String reply="You are currently at "+level+" level for "+topic+". "+fallback(req.message(),t,score)+"\n\nTip: after reviewing the explanation, take the recommended quiz so the adaptive engine can update your next learning step.";
        return new AiChatResponse(reply,"built-in-adaptive-tutor",level,context);
    }

    private String fallback(String msg, Topic t, int score) {
        if (t==null) return "Ask me about a course topic and I will explain it using your learning progress as context.";
        String content=t.getContent();
        String shortContent=content.length()>600?content.substring(0,600)+"...":content;
        if (score<50) return "Let's keep it simple. "+shortContent+" Your last mastery score suggests reviewing the basic definition and one small example first.";
        if (score<80) return "Here is a focused review: "+shortContent+" Try to connect the concept to a practical code example and then practice with medium questions.";
        return "You have a strong foundation. "+shortContent+" Now try explaining the concept in your own words and solving a harder application question.";
    }

    private String callExternal(String message, Topic t, String level, int score) throws Exception {
        String system="You are an adaptive university AI tutor. Explain clearly and concisely. Student level: "+level+", mastery score: "+score+"%. "+(t==null?"":("Current topic: "+t.getTitle()+". Course material: "+t.getContent()));
        Map<String,Object> body=Map.of("model",model==null||model.isBlank()?"gpt-5-mini":model,"messages",List.of(Map.of("role","system","content",system),Map.of("role","user","content",message)));
        HttpRequest request=HttpRequest.newBuilder(URI.create(apiUrl)).header("Authorization","Bearer "+apiKey).header("Content-Type","application/json").POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(body))).build();
        HttpResponse<String> response=HttpClient.newHttpClient().send(request,HttpResponse.BodyHandlers.ofString());
        JsonNode n=mapper.readTree(response.body()); return n.path("choices").path(0).path("message").path("content").asText("AI service returned no content.");
    }
}
