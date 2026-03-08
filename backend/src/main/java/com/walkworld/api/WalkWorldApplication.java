package com.walkworld.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class WalkWorldApplication {
    public static void main(String[] args) {
        SpringApplication.run(WalkWorldApplication.class, args);
    }
}
