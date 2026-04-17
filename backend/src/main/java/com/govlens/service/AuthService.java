package com.govlens.service;

import com.govlens.dto.AuthDTO;
import com.govlens.model.User;
import com.govlens.repository.UserRepository;
import com.govlens.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtProvider;

    public AuthService(UserRepository userRepo,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtProvider) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtProvider = jwtProvider;
    }

    public AuthDTO.LoginResponse authenticate(AuthDTO.LoginRequest request) {
        User user = userRepo.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!user.getActive()) {
            throw new RuntimeException("Account is deactivated");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        String accessToken = jwtProvider.generateAccessToken(user.getUsername(), user.getRole().name());
        String refreshToken = jwtProvider.generateRefreshToken(user.getUsername());

        return new AuthDTO.LoginResponse(
                accessToken,
                refreshToken,
                user.getRole().name(),
                jwtProvider.getAccessTokenExpiration()
        );
    }

    public AuthDTO.LoginResponse refresh(String refreshToken) {
        if (!jwtProvider.validateToken(refreshToken)) {
            throw new RuntimeException("Invalid refresh token");
        }

        String username = jwtProvider.getUsernameFromToken(refreshToken);
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String newAccessToken = jwtProvider.generateAccessToken(user.getUsername(), user.getRole().name());
        String newRefreshToken = jwtProvider.generateRefreshToken(user.getUsername());

        return new AuthDTO.LoginResponse(
                newAccessToken,
                newRefreshToken,
                user.getRole().name(),
                jwtProvider.getAccessTokenExpiration()
        );
    }
}
