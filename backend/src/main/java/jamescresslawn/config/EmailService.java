package jamescresslawn.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Sends transactional emails via the configured SMTP provider (Gmail).
 * All failures are caught and logged so a mail outage never breaks the
 * core registration or login flow.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    /**
     * Sends a welcome email to a newly registered user.
     *
     * @param to       recipient email address
     * @param fullName recipient's display name
     */
    public void sendVerificationEmail(String to, String code) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("Your James Cresslawn verification code");
            message.setText(
                "Your verification code is: " + code + "\n\n" +
                "This code expires in 10 minutes.\n\n" +
                "If you did not request this, please ignore this email.\n\n" +
                "The James Cresslawn Team"
            );
            mailSender.send(message);
            log.info("Verification email sent to {}", to);
        } catch (Exception e) {
            log.error("Failed to send verification email to {}: {}", to, e.getMessage());
            throw new RuntimeException("Could not send verification email — check MAIL_PASSWORD env var");
        }
    }

    public void sendWelcomeEmail(String to, String fullName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("Welcome to James Cresslawn Luxury Beds");
            message.setText(
                "Hi " + fullName + ",\n\n" +
                "Welcome to James Cresslawn Luxury Beds!\n\n" +
                "Your account has been created successfully. " +
                "Start exploring our curated collection of luxury beds and mattresses.\n\n" +
                "If you did not create this account, please ignore this email.\n\n" +
                "The James Cresslawn Team"
            );
            mailSender.send(message);
            log.info("Welcome email sent to {}", to);
        } catch (Exception e) {
            log.error("Failed to send welcome email to {}: {}", to, e.getMessage());
        }
    }
}
