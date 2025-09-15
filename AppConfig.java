package main.java.com.allai.meta_ai_backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {
    
    @Bean
    public RestTemplate restTemplate() {
        // This is used to make HTTP calls to AI APIs
        return new RestTemplate();
    }
    
    @Bean
    public ObjectMapper objectMapper() {
        // This is used to convert JSON to Java objects and vice versa
        return new ObjectMapper();
    }
}