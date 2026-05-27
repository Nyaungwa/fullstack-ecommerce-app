package jamescresslawn.payment;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

/**
 * What the backend sends back to the React frontend
 * when the user wants to pay for an order.
 *
 * The frontend uses this to build an HTML form and
 * submit it to PayFast, redirecting the user to the payment page.
 *
 * paymentUrl:  where to submit the form (PayFast's endpoint)
 * params:      all the form fields PayFast requires
 *
 */
@Data
@Builder
public class PayFastInitiateResponse {

    private String paymentUrl;      // https://sandbox.payfast.co.za/eng/process
    private Map<String, String> params;  // all form fields including signature
    private String orderId;
    private String amount;
}