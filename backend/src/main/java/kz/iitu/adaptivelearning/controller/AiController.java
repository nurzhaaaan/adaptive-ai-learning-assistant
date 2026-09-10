package kz.iitu.adaptivelearning.controller;
import kz.iitu.adaptivelearning.dto.LearningDtos.*;
import kz.iitu.adaptivelearning.service.AiTutorService;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/ai")
public class AiController {
 private final AiTutorService ai; public AiController(AiTutorService ai){this.ai=ai;}
 @PostMapping("/chat") public AiChatResponse chat(@RequestBody AiChatRequest request){return ai.chat(request);} 
}
