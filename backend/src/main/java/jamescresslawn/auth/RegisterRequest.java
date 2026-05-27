// ============================================================
// What the user sends when registering
// ============================================================
package jamescresslawn.auth;
 
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
 
@Data  // Lombok: generates getters, setters, toString, equals, hashCode
public class RegisterRequest {
 
    @NotBlank(message = "Full name is required")
    private String fullName;
 
    @Email(message = "Must be a valid email")
    @NotBlank(message = "Email is required")
    private String email;
 
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

}