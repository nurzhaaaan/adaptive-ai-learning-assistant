package kz.iitu.adaptivelearning.controller;
import kz.iitu.adaptivelearning.dto.LearningDtos.*;
import kz.iitu.adaptivelearning.service.AnalyticsService;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api")
public class DashboardController {
 private final AnalyticsService analytics; public DashboardController(AnalyticsService analytics){this.analytics=analytics;}
 @GetMapping("/dashboard") public Dashboard dashboard(){return analytics.dashboard();}
 @GetMapping("/analytics/overview") public Analytics analytics(){return analytics.overview();}
}
