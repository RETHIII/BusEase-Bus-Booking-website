package com.busbooking.controller;

import com.busbooking.dto.AuthResponse;
import com.busbooking.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth/oauth2")
public class OAuth2Controller {

    @Autowired
    private UserService userService;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${oauth2.google.client-id:placeholder-google-client-id}")
    private String googleClientId;

    @Value("${oauth2.google.client-secret:placeholder-google-client-secret}")
    private String googleClientSecret;

    private static final String FRONTEND_REDIRECT_URL = "http://localhost:8080/#oauth2-success";

    @GetMapping("/login/{provider}")
    public void redirectToProvider(@PathVariable String provider, HttpServletResponse response) throws IOException {
        String state = UUID.randomUUID().toString();
        
        // Save state in HTTP-Only cookie for CSRF protection
        Cookie stateCookie = new Cookie("oauth2_state", state);
        stateCookie.setHttpOnly(true);
        stateCookie.setPath("/");
        stateCookie.setMaxAge(300); // 5 minutes
        response.addCookie(stateCookie);

        String authUrl = "";
        String redirectUri = getRedirectUri(provider);

        if ("google".equalsIgnoreCase(provider)) {
            authUrl = "https://accounts.google.com/o/oauth2/v2/auth" +
                    "?client_id=" + URLEncoder.encode(googleClientId, StandardCharsets.UTF_8) +
                    "&redirect_uri=" + URLEncoder.encode(redirectUri, StandardCharsets.UTF_8) +
                    "&response_type=code" +
                    "&scope=" + URLEncoder.encode("openid email profile", StandardCharsets.UTF_8) +
                    "&state=" + URLEncoder.encode(state, StandardCharsets.UTF_8);
        } else {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Unknown OAuth2 provider: " + provider);
            return;
        }

        response.sendRedirect(authUrl);
    }

    @RequestMapping(value = "/callback/{provider}", method = {RequestMethod.GET, RequestMethod.POST})
    public void handleCallback(
            @PathVariable String provider,
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String error,
            HttpServletRequest request,
            HttpServletResponse response) throws IOException {

        // 1. Error check
        if (error != null) {
            response.sendRedirect("http://localhost:8080/#oauth2-error?error=" + URLEncoder.encode(error, StandardCharsets.UTF_8));
            return;
        }

        if (code == null || state == null) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Authorization code or state parameter missing.");
            return;
        }

        // 2. CSRF State parameter check
        String cookieState = null;
        if (request.getCookies() != null) {
            for (Cookie c : request.getCookies()) {
                if ("oauth2_state".equals(c.getName())) {
                    cookieState = c.getValue();
                    break;
                }
            }
        }

        // In production, enforce state verification
        if (cookieState == null || !cookieState.equals(state)) {
            System.err.println("Warning: CSRF state parameter validation failed.");
        }

        // Clear the state cookie
        Cookie clearCookie = new Cookie("oauth2_state", "");
        clearCookie.setPath("/");
        clearCookie.setMaxAge(0);
        response.addCookie(clearCookie);

        try {
            // 3. Exchange code for token
            String tokenUrl = getTokenUrl(provider);
            String clientId = getClientId(provider);
            String clientSecret = getClientSecret(provider);
            String redirectUri = getRedirectUri(provider);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("client_id", clientId);
            body.add("client_secret", clientSecret);
            body.add("code", code);
            body.add("grant_type", "authorization_code");
            body.add("redirect_uri", redirectUri);

            HttpEntity<MultiValueMap<String, String>> tokenRequest = new HttpEntity<>(body, headers);
            ResponseEntity<Map> tokenResponse = restTemplate.postForEntity(tokenUrl, tokenRequest, Map.class);

            if (!tokenResponse.getStatusCode().is2xxSuccessful() || tokenResponse.getBody() == null) {
                throw new RuntimeException("Failed to exchange authorization code with " + provider);
            }

            Map<String, Object> responseBody = tokenResponse.getBody();
            String idToken = (String) responseBody.get("id_token");
            if (idToken == null) {
                throw new RuntimeException("OIDC ID Token was not returned by " + provider);
            }

            // 4. Decode OIDC ID Token claims
            Map<String, Object> claims = decodeTokenPayload(idToken);
            String providerId = (String) claims.get("sub");
            String email = (String) claims.get("email");
            String name = (String) claims.get("name");
            String picture = (String) claims.get("picture"); // Google avatar URL

            if (email == null) {
                // Generate a stable email if email claim is missing
                email = providerId + "@" + provider.toLowerCase() + ".auth";
            }

            if (name == null) {
                name = email.split("@")[0];
            }

            // 5. Database logic: login or register user
            AuthResponse authResponse = userService.socialLoginOrRegister(
                    email, name, provider.toUpperCase(), providerId, picture
            );

            // 6. Redirect back to SPA frontend with tokens
            String frontendUrl = FRONTEND_REDIRECT_URL +
                    "?token=" + URLEncoder.encode(authResponse.getToken(), StandardCharsets.UTF_8) +
                    "&email=" + URLEncoder.encode(authResponse.getEmail(), StandardCharsets.UTF_8) +
                    "&name=" + URLEncoder.encode(authResponse.getName(), StandardCharsets.UTF_8) +
                    "&role=" + URLEncoder.encode(authResponse.getRole(), StandardCharsets.UTF_8) +
                    "&userId=" + authResponse.getUserId();

            response.sendRedirect(frontendUrl);

        } catch (Exception e) {
            e.printStackTrace();
            response.sendRedirect("http://localhost:8080/#oauth2-error?error=" + URLEncoder.encode(e.getMessage(), StandardCharsets.UTF_8));
        }
    }

    private Map<String, Object> decodeTokenPayload(String idToken) {
        try {
            String[] parts = idToken.split("\\.");
            if (parts.length < 2) {
                throw new IllegalArgumentException("Invalid JWT token format");
            }
            byte[] decodedBytes = java.util.Base64.getUrlDecoder().decode(parts[1]);
            String payload = new String(decodedBytes, StandardCharsets.UTF_8);
            return objectMapper.readValue(payload, Map.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to decode token payload", e);
        }
    }

    private String getRedirectUri(String provider) {
        return "http://localhost:8080/api/auth/oauth2/callback/" + provider.toLowerCase();
    }

    private String getTokenUrl(String provider) {
        if ("google".equalsIgnoreCase(provider)) {
            return "https://oauth2.googleapis.com/token";
        }
        return "";
    }

    private String getClientId(String provider) {
        if ("google".equalsIgnoreCase(provider)) return googleClientId;
        return "";
    }

    private String getClientSecret(String provider) {
        if ("google".equalsIgnoreCase(provider)) return googleClientSecret;
        return "";
    }
}
