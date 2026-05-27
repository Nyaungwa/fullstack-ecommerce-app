package jamescresslawn.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    // One payment belongs to one order 
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    // Which payment gateway processed this: "PAYFAST" or "STRIPE"
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentProvider provider;

    // The payment ID from PayFast/Stripe (their reference number)
    @Column(name = "provider_reference")
    private String providerReference;

    // PENDING = waiting for webhook, COMPLETED = paid, FAILED = payment failed
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    
    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    public enum PaymentProvider {
        PAYFAST, STRIPE
    }

    public enum PaymentStatus {
        PENDING, COMPLETED, FAILED, REFUNDED
    }
}
