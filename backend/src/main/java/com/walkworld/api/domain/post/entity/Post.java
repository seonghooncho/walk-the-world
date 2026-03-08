package com.walkworld.api.domain.post.entity;

import com.walkworld.api.global.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "posts")
@Getter @Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Post extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "city_id", nullable = false, length = 50)
    private String cityId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    /** S3 object key (pre-signed URL 방식) */
    @Column(name = "image_key", length = 500)
    private String imageKey;
}
