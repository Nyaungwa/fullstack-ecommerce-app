package jamescresslawn.repository;

import jamescresslawn.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository  // Marks this as a Spring-managed repository bean
public interface UserRepository extends JpaRepository<User, String> {

    // SELECT * FROM users WHERE email = ?
    Optional<User> findByEmail(String email);

    // SELECT COUNT(*) FROM users WHERE email = ?
    boolean existsByEmail(String email);
}
