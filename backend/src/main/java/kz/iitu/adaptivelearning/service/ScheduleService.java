package kz.iitu.adaptivelearning.service;

import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import kz.iitu.adaptivelearning.dto.ScheduleDtos.LessonRequest;
import kz.iitu.adaptivelearning.dto.ScheduleDtos.LessonView;
import kz.iitu.adaptivelearning.entity.ScheduleLesson;
import kz.iitu.adaptivelearning.entity.User;
import kz.iitu.adaptivelearning.repository.ScheduleLessonRepository;

@Service
@Transactional
public class ScheduleService {

    private final ScheduleLessonRepository lessons;
    private final CurrentUserService currentUserService;

    private static final Map<String, Integer>
            DAY_INDEX = Map.of(
            "MONDAY", 1,
            "TUESDAY", 2,
            "WEDNESDAY", 3,
            "THURSDAY", 4,
            "FRIDAY", 5,
            "SATURDAY", 6,
            "SUNDAY", 7
    );

    public ScheduleService(
            ScheduleLessonRepository lessons,
            CurrentUserService currentUserService
    ) {
        this.lessons = lessons;
        this.currentUserService =
                currentUserService;
    }

    @Transactional(readOnly = true)
    public List<LessonView> getLessons() {

        User user =
                currentUserService.requireUser();

        return lessons
                .findAllByUserIdOrderByDayIndexAscStartTimeAsc(
                        user.getId()
                )
                .stream()
                .map(this::toView)
                .toList();
    }

    public LessonView create(
            LessonRequest request
    ) {

        User user =
                currentUserService.requireUser();

        ScheduleLesson lesson =
                new ScheduleLesson();

        lesson.setUser(user);

        applyRequest(
                lesson,
                request
        );

        return toView(
                lessons.save(lesson)
        );
    }

    public LessonView update(
            Long id,
            LessonRequest request
    ) {

        User user =
                currentUserService.requireUser();

        ScheduleLesson lesson =
                lessons
                        .findByIdAndUserId(
                                id,
                                user.getId()
                        )
                        .orElseThrow(
                                () ->
                                        new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Сабақ табылмады"
                                        )
                        );

        applyRequest(
                lesson,
                request
        );

        return toView(
                lessons.save(lesson)
        );
    }

    public void delete(Long id) {

        User user =
                currentUserService.requireUser();

        ScheduleLesson lesson =
                lessons
                        .findByIdAndUserId(
                                id,
                                user.getId()
                        )
                        .orElseThrow(
                                () ->
                                        new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Сабақ табылмады"
                                        )
                        );

        lessons.delete(lesson);
    }

    private void applyRequest(
            ScheduleLesson lesson,
            LessonRequest request
    ) {

        String day =
                request.dayOfWeek()
                        .trim()
                        .toUpperCase(Locale.ROOT);

        Integer dayIndex =
                DAY_INDEX.get(day);

        if (dayIndex == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Апта күні дұрыс емес"
            );
        }

        String start =
                request.startTime().trim();

        String end =
                request.endTime().trim();

        if (end.compareTo(start) <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Сабақтың аяқталу уақыты басталу уақытынан кейін болуы керек"
            );
        }

        lesson.setDayOfWeek(day);
        lesson.setDayIndex(dayIndex);

        lesson.setSubject(
                request.subject().trim()
        );

        lesson.setStartTime(start);
        lesson.setEndTime(end);

        lesson.setRoom(
                clean(request.room())
        );

        lesson.setTeacher(
                clean(request.teacher())
        );
    }

    private String clean(String value) {

        if (value == null) {
            return null;
        }

        String result = value.trim();

        return result.isEmpty()
                ? null
                : result;
    }

    private LessonView toView(
            ScheduleLesson lesson
    ) {

        return new LessonView(
                lesson.getId(),
                lesson.getDayOfWeek(),
                lesson.getDayIndex(),
                lesson.getSubject(),
                lesson.getStartTime(),
                lesson.getEndTime(),
                lesson.getRoom(),
                lesson.getTeacher()
        );
    }
}