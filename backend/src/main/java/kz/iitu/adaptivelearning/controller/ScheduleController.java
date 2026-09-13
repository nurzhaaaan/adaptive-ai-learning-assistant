package kz.iitu.adaptivelearning.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import kz.iitu.adaptivelearning.dto.ScheduleDtos.LessonRequest;
import kz.iitu.adaptivelearning.dto.ScheduleDtos.LessonView;
import kz.iitu.adaptivelearning.service.ScheduleService;

@RestController
@RequestMapping("/api/schedule")
public class ScheduleController {

    private final ScheduleService service;

    public ScheduleController(
            ScheduleService service
    ) {
        this.service = service;
    }

    @GetMapping
    public List<LessonView> getLessons() {
        return service.getLessons();
    }

    @PostMapping
    public LessonView create(
            @Valid
            @RequestBody
            LessonRequest request
    ) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public LessonView update(
            @PathVariable Long id,

            @Valid
            @RequestBody
            LessonRequest request
    ) {
        return service.update(
                id,
                request
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id
    ) {

        service.delete(id);

        return ResponseEntity
                .noContent()
                .build();
    }
}