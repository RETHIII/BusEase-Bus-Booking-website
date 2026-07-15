package com.busbooking.service;

import com.busbooking.dto.AuthRequest;
import com.busbooking.dto.AuthResponse;
import com.busbooking.entity.User;
import com.busbooking.repository.UserRepository;
import com.busbooking.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Random;

@Service
public class UserService {

    private final Map<String, String> otpStorage = new ConcurrentHashMap<>();

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private AuthenticationManager authenticationManager;

    public AuthResponse register(AuthRequest.Register request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role("USER")
                .provider("LOCAL")
                .build();

        userRepository.save(user);

        String token = tokenProvider.generateToken(user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .role(user.getRole())
                .email(user.getEmail())
                .name(user.getName())
                .userId(user.getId())
                .build();
    }

    public AuthResponse login(AuthRequest.Login request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = tokenProvider.generateToken(authentication);

        return AuthResponse.builder()
                .token(token)
                .role(user.getRole())
                .email(user.getEmail())
                .name(user.getName())
                .userId(user.getId())
                .build();
    }

    public AuthResponse socialLogin(AuthRequest.SocialLogin request) {
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());
        User user;

        if (userOptional.isPresent()) {
            user = userOptional.get();
            if ("LOCAL".equals(user.getProvider())) {
                user.setProvider(request.getProvider());
                user.setProviderId(request.getProviderId());
                userRepository.save(user);
            }
        } else {
            user = User.builder()
                    .name(request.getName())
                    .email(request.getEmail())
                    .role("USER")
                    .provider(request.getProvider())
                    .providerId(request.getProviderId())
                    .build();
            userRepository.save(user);
        }

        String token = tokenProvider.generateToken(user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .role(user.getRole())
                .email(user.getEmail())
                .name(user.getName())
                .userId(user.getId())
                .build();
    }

    public String forgotPassword(AuthRequest.ForgotPassword request) {
        User user = userRepository.findByPhone(request.getPhone())
                .orElseThrow(() -> new RuntimeException("User not found with this phone number"));
        String otp = String.format("%06d", new Random().nextInt(1000000));
        otpStorage.put(request.getPhone(), otp);
        return otp;
    }

    public void resetPassword(AuthRequest.ResetPassword request) {
        String storedOtp = otpStorage.get(request.getPhone());
        if (storedOtp == null || !storedOtp.equals(request.getOtp())) {
            throw new RuntimeException("Invalid MFA OTP verification code");
        }
        User user = userRepository.findByPhone(request.getPhone())
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        otpStorage.remove(request.getPhone());
    }
}
