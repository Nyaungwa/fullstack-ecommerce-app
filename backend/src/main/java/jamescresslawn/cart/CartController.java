package jamescresslawn.cart;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST controller for shopping cart operations.
 * Exposes endpoints under /api/cart. All endpoints require authentication.
 */
@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CartController {

    private final CartService cartService;

    /**
     * GET /api/cart
     * Returns all cart items for the logged-in user.
     */
    @GetMapping
    public ResponseEntity<?> getCart() {
        try {
            return ResponseEntity.ok(cartService.getCart());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /api/cart
     * Add a product to the cart.
     */
    @PostMapping
    public ResponseEntity<?> addToCart(@Valid @RequestBody AddToCartRequest request) {
        try {
            CartItemResponse item = cartService.addToCart(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(item);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * PUT /api/cart/{id}
     * Update the quantity of a cart item.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateQuantity(
            @PathVariable String id,
            @Valid @RequestBody UpdateCartRequest request) {
        try {
            CartItemResponse item = cartService.updateQuantity(id, request);
            return ResponseEntity.ok(item);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * DELETE /api/cart/{id}
     * Remove an item from the cart.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> removeFromCart(@PathVariable String id) {
        try {
            cartService.removeFromCart(id);
            return ResponseEntity.ok(Map.of("message", "Item removed from cart"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}