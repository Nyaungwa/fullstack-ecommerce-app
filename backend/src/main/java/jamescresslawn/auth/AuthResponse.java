// ============================================================
// What we send back after successful login or register
// ============================================================
package jamescresslawn.auth;
 
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
 
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
 
    private String token;       // The JWT token the client will use for future requests
    private String email;
    private String fullName;
    private String role;
    private String message;     // e.g. "Registration successful"
}