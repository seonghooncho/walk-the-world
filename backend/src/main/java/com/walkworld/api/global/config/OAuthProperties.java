package com.walkworld.api.global.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "oauth")
public class OAuthProperties {

    private final Kakao kakao = new Kakao();

    @Getter
    @Setter
    public static class Kakao {
        private String clientId;
        private String clientSecret;
    }
}
