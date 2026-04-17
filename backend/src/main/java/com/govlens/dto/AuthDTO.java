package com.govlens.dto;

public class AuthDTO {

    public static class LoginRequest {
        private String username;
        private String password;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class LoginResponse {
        private String accessToken;
        private String refreshToken;
        private String role;
        private long expiresIn;

        public LoginResponse(String accessToken, String refreshToken, String role, long expiresIn) {
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
            this.role = role;
            this.expiresIn = expiresIn;
        }

        public String getAccessToken() { return accessToken; }
        public String getRefreshToken() { return refreshToken; }
        public String getRole() { return role; }
        public long getExpiresIn() { return expiresIn; }
    }
}
