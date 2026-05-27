 
// ============================================================
// What we send back to the frontend - clean version of CartItem
// We never send the full entity directly because it contains
// circular references (User → Orders → User) that break JSON
// ============================================================
package jamescresslawn.cart;
 
import jamescresslawn.entity.CartItem;
import lombok.Builder;
import lombok.Data;
 
import java.math.BigDecimal;
 
@Data
@Builder
public class CartItemResponse {
 
    private String id;
    private String productId;
    private String productName;
    private String productImageUrl;
    private BigDecimal unitPrice;      // price per single item
    private int quantity;
    private BigDecimal itemTotal;      // unitPrice × quantity
 
    public static CartItemResponse from(CartItem cartItem) {
        BigDecimal price = cartItem.getProduct().getEffectivePrice();
        return CartItemResponse.builder()
                .id(cartItem.getId())
                .productId(cartItem.getProduct().getId())
                .productName(cartItem.getProduct().getName())
                .productImageUrl(cartItem.getProduct().getImageUrl())
                .unitPrice(price)
                .quantity(cartItem.getQuantity())
                .itemTotal(price.multiply(BigDecimal.valueOf(cartItem.getQuantity())))
                .build();
    }
}