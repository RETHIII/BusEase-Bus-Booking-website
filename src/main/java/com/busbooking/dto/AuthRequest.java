package com.busbooking.dto;

import lombok.Data;

public class AuthRequest {

    @Data
    public static class Login {
        private String email;
        private String password;
    }

    @Data
    public static class Register {
        private String name;
        private String email;
        private String password;
        private String phone;
    }

    @Data
    public static class SocialLogin {
        private String name;
        private String email;
        private String provider; // GOOGLE, APPLE, MICROSOFT
        private String providerId;
    }

    @Data
    public static class ForgotPassword {
        private String phone;
    }

    @Data
    public static class ResetPassword {
        private String phone;
        private String otp;
        private String newPassword;
    }
}
