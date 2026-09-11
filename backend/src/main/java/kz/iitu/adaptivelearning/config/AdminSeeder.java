package kz.iitu.adaptivelearning.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import kz.iitu.adaptivelearning.entity.Role;
import kz.iitu.adaptivelearning.entity.User;
import kz.iitu.adaptivelearning.repository.UserRepository;

@Configuration
public class AdminSeeder {

    @Bean
    CommandLineRunner seedAdmins(
            UserRepository users,
            PasswordEncoder encoder
    ) {

        return args -> {

            String password =
                    System.getenv("ADMIN_PASSWORD");

            if (
                    password == null ||
                    password.isBlank()
            ) {

                System.out.println(
                        "ADMIN_PASSWORD is not configured. "
                                + "Admin accounts were not created."
                );

                return;
            }

            createAdmin(
                    users,
                    encoder,
                    "adok",
                    "Adok",
                    "adok@adaptive-ai.local",
                    password
            );

            createAdmin(
                    users,
                    encoder,
                    "nurzhik",
                    "Nurzhik",
                    "nurzhik@adaptive-ai.local",
                    password
            );

            createAdmin(
                    users,
                    encoder,
                    "alikh",
                    "Alikh",
                    "alikh@adaptive-ai.local",
                    password
            );
        };
    }

    private void createAdmin(
            UserRepository users,
            PasswordEncoder encoder,
            String username,
            String name,
            String email,
            String password
    ) {

        User user =
                users.findByUsernameIgnoreCase(username)
                        .orElseGet(() ->
                                users.findByEmail(email)
                                        .orElseGet(User::new)
                        );

        user.setUsername(
                username.toLowerCase()
        );

        user.setName(name);

        user.setEmail(
                email.toLowerCase()
        );

        user.setPasswordHash(
                encoder.encode(password)
        );

        user.setRole(
                Role.ADMIN
        );

        users.save(user);

        System.out.println(
                "ADMIN ready: " + username
        );
    }
}