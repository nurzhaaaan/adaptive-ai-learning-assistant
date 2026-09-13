package kz.iitu.adaptivelearning.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public final class AuthDtos {

    private AuthDtos() {}

    public record RegisterRequest(
            @NotBlank(message = "Аты міндетті")
            @Size(max = 120)
            String name,

            @NotBlank(message = "Username міндетті")
            @Size(
                    min = 3,
                    max = 30,
                    message = "Username 3-30 символ болуы керек"
            )
            @Pattern(
                    regexp = "^[\\p{L}\\p{N}._-]+$",
                    message = "Username ішінде әріп, сан, нүкте, _ және - қолдануға болады"
            )
            String username,

            @Email(message = "Email форматы дұрыс емес")
            @NotBlank(message = "Email міндетті")
            String email,

            @NotBlank(message = "Құпия сөз міндетті")
            @Size(
                    min = 6,
                    message = "Құпия сөз кемінде 6 символ болуы керек"
            )
            String password
    ) {}

    public record LoginRequest(
            @NotBlank(message = "Email немесе username міндетті")
            String identifier,

            @NotBlank(message = "Құпия сөз міндетті")
            String password
    ) {}

    public record AuthResponse(
            String token,
            Long userId,
            String name,
            String username,
            String email,
            String role
    ) {}
}