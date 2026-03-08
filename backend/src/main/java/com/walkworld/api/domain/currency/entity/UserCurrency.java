package com.walkworld.api.domain.currency.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_currency")
@Getter @Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class UserCurrency {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @Column(nullable = false)
    @Builder.Default
    private Integer coupons = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer hearts = 0;
}
