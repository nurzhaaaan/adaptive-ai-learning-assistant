package kz.iitu.adaptivelearning.service;

import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

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

    public AuthResponse register(RegisterRequest req) {

        String name = req.name().trim();

        String username = req.username()
                .trim()
                .toLowerCase(Locale.ROOT);

        String email = req.email()
                .trim()
                .toLowerCase(Locale.ROOT);

        if (users.existsByEmail(email)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Бұл email бұрын тіркелген"
            );
        }

        if (users.existsByUsernameIgnoreCase(username)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Бұл username бос емес"
            );
        }

        User user = new User();

        user.setName(name);
        user.setUsername(username);
        user.setEmail(email);
        user.setPasswordHash(
                encoder.encode(req.password())
        );

        // Register арқылы ешкім ADMIN бола алмайды
        user.setRole(Role.STUDENT);

        users.save(user);

        return createResponse(user);
    }

    public AuthResponse login(LoginRequest req) {

        String identifier = req.identifier()
                .trim()
                .toLowerCase(Locale.ROOT);

        Authentication authentication =
                authManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                identifier,
                                req.password()
                        )
                );

        /*
         * CustomUserDetailsService username орнына
         * canonical email қайтарады.
         * Сондықтан JWT-те email қалады.
         */
        String authenticatedEmail =
                authentication.getName()
                        .trim()
                        .toLowerCase(Locale.ROOT);

        User user = users.findByEmail(authenticatedEmail)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED,
                                "Қолданушы табылмады"
                        )
                );

        return createResponse(user);
    }

    private AuthResponse createResponse(User user) {

        return new AuthResponse(
                jwt.generateToken(user.getEmail()),
                user.getId(),
                user.getName(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name()
        );
    }
}