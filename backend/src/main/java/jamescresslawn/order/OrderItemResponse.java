package jamescresslawn.order;

import jamescresslawn.entity.OrderItem;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

/**
 * Clean JSON-safe representation of one line item in an order.
 *
 */
@Data
@Builder
public class OrderItemResponse {

    private String id;
    private String productId;       
    private String productName;  
    private BigDecimal unitPrice;   // SNAPSHOT: copied at order time
    private int quantity;
    private BigDecimal itemTotal;   

    public static OrderItemResponse from(OrderItem item) {
        return OrderItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProductName())          
                .unitPrice(item.getUnitPrice())             
                .quantity(item.getQuantity())
                .itemTotal(item.getSubtotal())              
                .build();
    }
}