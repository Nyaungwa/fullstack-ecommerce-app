package jamescresslawn.auth;

import jamescresslawn.config.EmailService;
import jamescresslawn.entity.User;
import jamescresslawn.jwt.JwtUtil;
import jamescresslawn.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.UUID;

/**
 * Service layer for authentication business logic.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    /**
     * Registers a new user account and immediately returns a JWT token on success.
     * The password is BCrypt-hashed before storage.
     * Throws a {@code RuntimeException} if the email address is already in use.
     *
     * @param request the registration payload
     * @return an {@link AuthResponse} containing the JWT token and user details
     */
    @SuppressWarnings("null")
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered: " + request.getEmail());
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.USER)
                .build();

        userRepository.save(user);
        log.info("New user registered: {}", user.getEmail());

        emailService.sendWelcomeEmail(user.getEmail(), user.getFullName());

        String token = jwtUtil.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .message("Registration successful")
                .build();
    }

    /**
     * Authenticates a user with email and password and returns a JWT token.
     * Credential verification is delegated to Spring's {@code AuthenticationManager},
     * which throws {@code BadCredentialsException} automatically on failure.
     *
     * @param request the login payload
     * @return an {@link AuthResponse} containing the JWT token and user details
     */
    public AuthResponse login(AuthRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        log.info("User logged in: {}", user.getEmail());

        String token = jwtUtil.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .message("Login successful")
                .build();
    }

    /**
     * Authenticates a user via Google Sign-In.
     * Verifies the Google access token against Google's userinfo endpoint,
     * then finds or creates a local user account and returns a JWT token.
     *
     * @param accessToken the Google access token from the frontend
     * @return an {@link AuthResponse} containing the JWT token and user details
     */
    @SuppressWarnings({"null", "unchecked"})
    public AuthResponse googleLogin(String accessToken) {

        // Verify token and fetch user info from Google
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                HttpMethod.GET,
                entity,
                Map.class
        );

        Map<String, Object> userInfo = response.getBody();
        if (userInfo == null) {
            throw new RuntimeException("Failed to retrieve user info from Google");
        }

        String email    = (String) userInfo.get("email");
        String name     = (String) userInfo.get("name");
        String googleId = (String) userInfo.get("sub");

        if (email == null) {
            throw new RuntimeException("Google account did not return an email address");
        }

        log.info("Google sign-in attempt for email: {}", email);

        // Find existing user or create a new one
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = User.builder()
                    .email(email)
                    .fullName(name != null ? name : email)
                    // Google users have no password — store a random hash that can never be guessed
                    .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .role(User.Role.USER)
                    .build();
            userRepository.save(newUser);
            log.info("New user created via Google Sign-In: {} (googleId={})", email, googleId);
            return newUser;
        });

        String token = jwtUtil.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .message("Google login successful")
                .build();
    }
}
