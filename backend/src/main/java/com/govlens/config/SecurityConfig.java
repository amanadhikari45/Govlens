package com.govlens.config;

import com.govlens.security.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final CorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter,
                          CorsConfigurationSource corsConfigurationSource) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.corsConfigurationSource = corsConfigurationSource;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // FIX: explicitly wire CORS so preflight OPTIONS requests pass through
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/actuator/health").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/departments/**").hasAnyRole("ANALYST","MANAGER","ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/requests/**").hasAnyRole("ANALYST","MANAGER","ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/requests").hasAnyRole("ANALYST","MANAGER","ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/requests/**").hasAnyRole("MANAGER","ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/requests/**").hasRole("ADMIN")
                .requestMatchers("/api/analytics/**").hasAnyRole("ANALYST","MANAGER","ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/insights/**").hasAnyRole("MANAGER","ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/insights/**").hasAnyRole("ANALYST","MANAGER","ADMIN")
                .requestMatchers("/api/audit/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }
}
