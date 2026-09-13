package kz.iitu.adaptivelearning.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public final class ScheduleDtos {

    private ScheduleDtos() {}

    public record LessonRequest(

            @NotBlank
            String dayOfWeek,

            @NotBlank(message = "Пән атауын енгізіңіз")
            @Size(max = 160)
            String subject,

            @NotBlank
            @Pattern(
                    regexp = "^([01]\\d|2[0-3]):[0-5]\\d$",
                    message = "Уақыт HH:mm форматында болуы керек"
            )
            String startTime,

            @NotBlank
            @Pattern(
                    regexp = "^([01]\\d|2[0-3]):[0-5]\\d$",
                    message = "Уақыт HH:mm форматында болуы керек"
            )
            String endTime,

            @Size(max = 160)
            String room,

            @Size(max = 160)
            String teacher
    ) {}

    public record LessonView(
            Long id,
            String dayOfWeek,
            Integer dayIndex,
            String subject,
            String startTime,
            String endTime,
            String room,
            String teacher
    ) {}
}