package kz.iitu.adaptivelearning.config;

import java.util.Locale;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import kz.iitu.adaptivelearning.entity.Role;
import kz.iitu.adaptivelearning.entity.User;
import kz.iitu.adaptivelearning.repository.UserRepository;

@Configuration
public class StudentUsernameBackfill {

    @Bean
    CommandLineRunner backfillStudentUsernames(
            UserRepository users
    ) {

        return args -> {

            for (User user :
                    users.findAllByRoleOrderByCreatedAtDesc(
                            Role.STUDENT
                    )) {

                if (
                        user.getUsername() != null &&
                        !user.getUsername().isBlank()
                ) {
                    continue;
                }

                String base =
                        createBaseUsername(
                                user.getEmail(),
                                user.getId()
                        );

                String candidate = base;
                int number = 2;

                while (
                        users.existsByUsernameIgnoreCase(
                                candidate
                        )
                ) {

                    String suffix =
                            String.valueOf(number++);

                    int maxBaseLength =
                            30 - suffix.length();

                    String shortened =
                            base.length() > maxBaseLength
                                    ? base.substring(
                                            0,
                                            maxBaseLength
                                    )
                                    : base;

                    candidate =
                            shortened + suffix;
                }

                user.setUsername(candidate);

                users.save(user);

                System.out.println(
                        "STUDENT username ready: "
                                + candidate
                );
            }
        };
    }

    private String createBaseUsername(
            String email,
            Long id
    ) {

        String base = "";

        if (
                email != null &&
                email.contains("@")
        ) {

            base = email
                    .substring(
                            0,
                            email.indexOf("@")
                    )
                    .trim()
                    .toLowerCase(Locale.ROOT)
                    .replaceAll(
                            "[^\\p{L}\\p{N}._-]",
                            ""
                    );
        }

        if (base.length() < 3) {

            base =
                    "student" +
                    (id == null ? "" : id);
        }

        if (base.length() > 30) {

            base =
                    base.substring(0, 30);
        }

        return base;
    }
}