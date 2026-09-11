package kz.iitu.adaptivelearning.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import kz.iitu.adaptivelearning.entity.User;
import kz.iitu.adaptivelearning.repository.UserRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository users;

    public CustomUserDetailsService(
            UserRepository users
    ) {
        this.users = users;
    }

    @Override
    public UserDetails loadUserByUsername(
            String identifier
    ) throws UsernameNotFoundException {

        String value =
                identifier.trim().toLowerCase();

        User user;

        if (value.contains("@")) {
            user = users
                    .findByEmail(value)
                    .orElseThrow(
                            () -> new UsernameNotFoundException(
                                    "User not found"
                            )
                    );
        } else {
            user = users
                    .findByUsernameIgnoreCase(value)
                    .orElseThrow(
                            () -> new UsernameNotFoundException(
                                    "User not found"
                            )
                    );
        }

        /*
         * IMPORTANT:
         * Spring authentication principal remains email.
         *
         * Therefore:
         * JWT subject -> email
         * CurrentUserService -> email
         *
         * Existing system keeps working.
         */
        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPasswordHash())
                .roles(user.getRole().name())
                .build();
    }
}