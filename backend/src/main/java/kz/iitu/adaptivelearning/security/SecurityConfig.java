package kz.iitu.adaptivelearning.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .cors(cors ->
                        cors.configurationSource(
                                corsConfigurationSource()
                        )
                )

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        // CORS preflight
                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        ).permitAll()

                        // Authentication
                        .requestMatchers(
                                "/api/auth/**"
                        ).permitAll()

                        // Health check
                        .requestMatchers(
                                "/api/health/**",
                                "/health"
                        ).permitAll()

                        // Diagnostic
                        .requestMatchers(
                                "/api/diagnostic/**"
                        ).permitAll()

                        // H2 console - local development
                        .requestMatchers(
                                "/h2-console/**"
                        ).permitAll()

                        // Everything else
                        .anyRequest()
                        .authenticated()
                )

                .headers(headers ->
                        headers.frameOptions(
                                frame -> frame.sameOrigin()
                        )
                )

                .addFilterBefore(
                        jwtFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    /*
     * Password encoder used by:
     * - registration
     * - login
     * - demo user seeding
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /*
     * Authentication manager
     */
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration
    ) throws Exception {

        return configuration.getAuthenticationManager();
    }

    /*
     * CORS configuration
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        /*
         * Local development + Production Vercel
         */
        configuration.setAllowedOriginPatterns(
                List.of(
                        "http://localhost:5173",
                        "http://127.0.0.1:5173",

                        // Main production frontend
                        "https://adaptive-ai-learning-assistant.vercel.app",

                        // Vercel preview deployments
                        "https://*.vercel.app"
                )
        );

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of(
                        "Authorization",
                        "Content-Type",
                        "Accept",
                        "Origin",
                        "X-Requested-With"
                )
        );

        configuration.setExposedHeaders(
                List.of(
                        "Authorization",
                        "Content-Type"
                )
        );

        configuration.setAllowCredentials(true);

        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}