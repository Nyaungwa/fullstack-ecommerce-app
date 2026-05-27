package jamescresslawn.order;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for order management.
 * Exposes endpoints under /api/orders. All endpoints require authentication.
 */
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

    /**
     * POST /api/orders
     *
     * Creates a new order from the user's current cart.
     * Requires: JWT token in Authorization header.
     *
     */
    @PostMapping
    public ResponseEntity<?> createOrder(
            @RequestBody(required = false) CreateOrderRequest request) {
        try {
            if (request == null) {
                request = new CreateOrderRequest();
            }
            OrderResponse response = orderService.createOrder(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/orders
     *
     * Returns all orders for the logged-in user, newest first.
     * Used for the "My Orders" / order history page.
     */
    @GetMapping
    public ResponseEntity<?> getMyOrders() {
        try {
            List<OrderResponse> orders = orderService.getMyOrders();
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/orders/{id}
     *
     * Returns a single order with all its items.
     * Used for the order confirmation page and order tracking.
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrder(@PathVariable String id) {
        try {
            OrderResponse order = orderService.getOrder(id);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}