package jamescresslawn.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    @NotBlank
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductSize size;

    @Enumerated(EnumType.STRING)
    @Column(name = "comfort_level")
    private ComfortLevel comfortLevel;

    @Column(nullable = false, precision = 10, scale = 2)
    @NotNull
    @Positive
    private BigDecimal price;

    @Column(name = "discount_price", precision = 10, scale = 2)
    private BigDecimal discountPrice;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "in_stock", nullable = false)
    @Builder.Default
    private Boolean inStock = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    /**
     * Returns the applicable selling price: the discount price if set, otherwise the regular price.
     *
     * @return effective price for order calculations
     */
    public BigDecimal getEffectivePrice() {
        return discountPrice != null ? discountPrice : price;
    }

    public enum ProductType {
        BED, MATTRESS
    }

    public enum ProductSize {
        SINGLE, THREE_QUARTER, DOUBLE, QUEEN, KING
    }

    public enum ComfortLevel {
        SOFT, MEDIUM, FIRM, EXTRA_FIRM
    }
}
