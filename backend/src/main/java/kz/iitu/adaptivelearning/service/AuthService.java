package kz.iitu.adaptivelearning.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import kz.iitu.adaptivelearning.dto.AuthDtos.*;
import kz.iitu.adaptivelearning.dto.AuthDtos.AuthResponse;
import kz.iitu.adaptivelearning.dto.AuthDtos.LoginRequest;
import kz.iitu.adaptivelearning.dto.AuthDtos.RegisterRequest;
import kz.iitu.adaptivelearning.entity.Role;
import kz.iitu.adaptivelearning.entity.User;
import kz.iitu.adaptivelearning.repository.UserRepository;
import kz.iitu.adaptivelearning.security.JwtService;

@Service
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final AuthenticationManager authManager;
    private final JwtService jwt;

    public AuthService(
            UserRepository users,
            PasswordEncoder encoder,
            AuthenticationManager authManager,
            JwtService jwt
    ) {
        this.users = users;
        this.encoder = encoder;
        this.authManager = authManager;
        this.jwt = jwt;
    }

    public AuthResponse register(
            RegisterRequest req
    ) {

        String email =
                req.email().trim().toLowerCase();

        if (users.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "Email is already registered"
            );
        }

        User user = new User();

        user.setName(req.name().trim());
        user.setUsername(null);
        user.setEmail(email);
        user.setPasswordHash(
                encoder.encode(req.password())
        );
        user.setRole(Role.STUDENT);

        users.save(user);

        return new AuthResponse(
                jwt.generateToken(user.getEmail()),
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name()
        );
    }

    public AuthResponse login(
            LoginRequest req
    ) {

        String identifier =
                req.identifier()
                        .trim()
                        .toLowerCase();

        Authentication authentication =
                authManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                identifier,
                                req.password()
                        )
                );

        /*
         * CustomUserDetailsService returns the
         * user's canonical email as principal.
         */
        String authenticatedEmail =
                authentication.getName();

        User user = users
                .findByEmail(authenticatedEmail)
                .orElseThrow(
                        () -> new IllegalStateException(
                                "Authenticated user not found"
                        )
                );

        return new AuthResponse(
                jwt.generateToken(user.getEmail()),
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name()
        );
    }
}