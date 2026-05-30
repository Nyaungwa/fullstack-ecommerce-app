package jamescresslawn.auth;

import lombok.Data;

/**
 * Request body for POST /api/auth/google.
 * The frontend sends the Google access token obtained from @react-oauth/google.
 */
@Data
public class GoogleTokenRequest {
    private String token;
}
