package com.govlens;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class GovLensApplication {

    public static void main(String[] args) {
        SpringApplication.run(GovLensApplication.class, args);
    }
}
