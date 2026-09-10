package kz.iitu.adaptivelearning.controller;
import jakarta.validation.Valid;
import kz.iitu.adaptivelearning.dto.AuthDtos.*;
import kz.iitu.adaptivelearning.service.AuthService;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/auth")
public class AuthController {
 private final AuthService auth; public AuthController(AuthService auth){this.auth=auth;}
 @PostMapping("/register") public AuthResponse register(@Valid @RequestBody RegisterRequest r){return auth.register(r);} 
 @PostMapping("/login") public AuthResponse login(@Valid @RequestBody LoginRequest r){return auth.login(r);} 
}
