package com.busbooking.controller;

import com.busbooking.dto.AuthRequest;
import com.busbooking.dto.AuthResponse;
import com.busbooking.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody AuthRequest.Register request) {
        return ResponseEntity.ok(userService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest.Login request) {
        return ResponseEntity.ok(userService.login(request));
    }

    @PostMapping("/social-login")
    public ResponseEntity<AuthResponse> socialLogin(@RequestBody AuthRequest.SocialLogin request) {
        return ResponseEntity.ok(userService.socialLogin(request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody AuthRequest.ForgotPassword request) {
        String otp = userService.forgotPassword(request);
        return ResponseEntity.ok(java.util.Map.of("otp", otp));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody AuthRequest.ResetPassword request) {
        userService.resetPassword(request);
        return ResponseEntity.ok().build();
    }
}
