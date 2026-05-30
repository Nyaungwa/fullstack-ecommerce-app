package jamescresslawn.auth;

import jamescresslawn.config.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class VerificationService {

    private final EmailService emailService;

    private final Map<String, CodeEntry> store = new ConcurrentHashMap<>();
    private static final long EXPIRY_MS = 10 * 60 * 1000L;

    public void sendCode(String email) {
        String code = String.format("%06d", new Random().nextInt(1_000_000));
        store.put(email.toLowerCase(), new CodeEntry(code, Instant.now().toEpochMilli()));
        emailService.sendVerificationEmail(email, code);
        log.info("Verification code dispatched to {}", email);
    }

    public boolean verify(String email, String code) {
        String key = email.toLowerCase();
        CodeEntry entry = store.get(key);
        log.info("verify() → email='{}' | received='{}' | stored='{}'",
                key, code, entry != null ? entry.code() : "NOT FOUND");
        if (entry == null) return false;
        long age = Instant.now().toEpochMilli() - entry.timestamp();
        if (age > EXPIRY_MS) {
            store.remove(key);
            log.warn("verify() → code expired for {} (age={}ms)", key, age);
            return false;
        }
        boolean match = entry.code().equals(code.trim());
        if (match) store.remove(key);
        log.info("verify() → match={}", match);
        return match;
    }

    private record CodeEntry(String code, long timestamp) {}
}
