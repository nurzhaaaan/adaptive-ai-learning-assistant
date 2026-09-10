package kz.iitu.adaptivelearning.service;

import kz.iitu.adaptivelearning.dto.AuthDtos.*;
import kz.iitu.adaptivelearning.entity.*;
import kz.iitu.adaptivelearning.repository.UserRepository;
import kz.iitu.adaptivelearning.security.JwtService;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository users; private final PasswordEncoder encoder; private final AuthenticationManager authManager; private final JwtService jwt;
    public AuthService(UserRepository users, PasswordEncoder encoder, AuthenticationManager authManager, JwtService jwt) { this.users=users; this.encoder=encoder; this.authManager=authManager; this.jwt=jwt; }
    public AuthResponse register(RegisterRequest req) {
        if (users.existsByEmail(req.email().toLowerCase())) throw new IllegalArgumentException("Email is already registered");
        User u=new User(); u.setName(req.name().trim()); u.setEmail(req.email().toLowerCase().trim()); u.setPasswordHash(encoder.encode(req.password())); u.setRole(Role.STUDENT); users.save(u);
        return new AuthResponse(jwt.generateToken(u.getEmail()),u.getId(),u.getName(),u.getEmail(),u.getRole().name());
    }
    public AuthResponse login(LoginRequest req) {
        authManager.authenticate(new UsernamePasswordAuthenticationToken(req.email().toLowerCase().trim(),req.password()));
        User u=users.findByEmail(req.email().toLowerCase().trim()).orElseThrow();
        return new AuthResponse(jwt.generateToken(u.getEmail()),u.getId(),u.getName(),u.getEmail(),u.getRole().name());
    }
}
