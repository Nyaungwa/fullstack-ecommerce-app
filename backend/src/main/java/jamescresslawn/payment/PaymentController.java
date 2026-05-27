package jamescresslawn.payment;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * REST controller for PayFast payment operations.
 * Exposes the payment initiation endpoint and the ITN webhook receiver.
 */
@RestController
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * POST /api/payments/payfast/{orderId}
     *
     * Called by the React frontend when user clicks "Pay Now".
     * Returns the PayFast payment URL and all required form parameters.
     *
     * The frontend uses this to redirect the user to PayFast.
     *
     * Requires: JWT token (user must be logged in)
     */
    @PostMapping("/api/payments/payfast/{orderId}")
    public ResponseEntity<?> initiatePayment(@PathVariable String orderId) {
        try {
            PayFastInitiateResponse response = paymentService.initiatePayment(orderId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Payment initiation failed for order {}: {}", orderId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /webhooks/payfast
     *
     * This is the ITN (Instant Transaction Notification) endpoint.
     * PayFast calls this URL directly after a payment is processed.
     *
     * NB:
     * 1. This endpoint MUST be publicly accessible - ngrok
     * 2. This endpoint MUST NOT require authentication (PayFast has no JWT)
     * 3. This MUST return HTTP 200 — PayFast retries failed webhooks
     * 4. Never mark an order as paid from the frontend — only from here
     *
     * PayFast sends form data (not JSON), so we use HttpServletRequest
     * to read all parameters manually.
     */
    @PostMapping("/webhooks/payfast")
    public ResponseEntity<String> handleItn(HttpServletRequest request) {
        try {
            // PayFast sends application/x-www-form-urlencoded, not JSON.
            Map<String, String> itnData = new HashMap<>();
            request.getParameterMap().forEach((key, values) -> {
                if (values != null && values.length > 0) {
                    itnData.put(key, values[0]);
                }
            });

            log.info("PayFast ITN received with {} parameters", itnData.size());

            paymentService.handleItn(itnData);

            // PayFast retries the ITN if we return anything other than 200.
            return ResponseEntity.ok("OK");

        } catch (Exception e) {
            log.error("PayFast ITN processing failed: {}", e.getMessage(), e);
            // Return 200 even on internal errors to prevent PayFast retry spam.
            return ResponseEntity.ok("OK");
        }
    }
}