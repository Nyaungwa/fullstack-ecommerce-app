package jamescresslawn.order;

import jamescresslawn.entity.Order;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * What we send back to the frontend after an order is created or fetched.
 *
 * We never return the Order entity directly because:
 * 1. It has a User field which has a passwordHash field — security risk
 * 2. It has circular references (Order → OrderItems → Order) that
 *    break JSON serialization
 *
 * This DTO is flat, safe, and contains only what the frontend needs.
 */
@Data
@Builder
public class OrderResponse {

    private String orderId;
    private String status;           // PENDING, PAID, PROCESSING, SHIPPED, DELIVERED
    private BigDecimal totalAmount;
    private String shippingAddress;
    private String trackingNumber;   // null until shipped
    private LocalDateTime createdAt;
    private List<OrderItemResponse> items;
    private int itemCount;           
    private String message;         

    public static OrderResponse from(Order order, String message) {
        List<OrderItemResponse> items = order.getOrderItems().stream()
                .map(OrderItemResponse::from)
                .collect(Collectors.toList());

        int itemCount = items.stream()
                .mapToInt(OrderItemResponse::getQuantity)
                .sum();

        return OrderResponse.builder()
                .orderId(order.getId())
                .status(order.getStatus().name())
                .totalAmount(order.getTotalAmount())
                .shippingAddress(order.getShippingAddress())
                .trackingNumber(order.getTrackingNumber())
                .createdAt(order.getCreatedAt())
                .items(items)
                .itemCount(itemCount)
                .message(message)
                .build();
    }
}