package kz.iitu.adaptivelearning.controller;
import kz.iitu.adaptivelearning.dto.LearningDtos.*;
import kz.iitu.adaptivelearning.service.DiagnosticService;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/diagnostic")
public class DiagnosticController {
 private final DiagnosticService service; public DiagnosticController(DiagnosticService service){this.service=service;}
 @GetMapping("/course/{courseId}") public DiagnosticView get(@PathVariable Long courseId){return service.get(courseId);}
 @PostMapping("/course/{courseId}/submit") public DiagnosticResult submit(@PathVariable Long courseId,@RequestBody DiagnosticSubmitRequest request){return service.submit(courseId,request);}
}
