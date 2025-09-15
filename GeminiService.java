package com.allai.meta_ai_backend.service;

import com.allai.meta_ai_backend.model.ProviderResult;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {
    
    private static final Logger logger = LoggerFactory.getLogger(GeminiService.class);
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    // These values come from application.properties
    @Value("${gemini.api.key}")
    private String apiKey;
    
    @Value("${gemini.api.url}")
    private String apiUrl;
    
    // Constructor - Spring will inject RestTemplate and ObjectMapper automatically
    public GeminiService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }
    
    /**
     * Main method to search using Gemini API
     * @param query - The user's question
     * @return ProviderResult - Contains the response or error
     */
    public ProviderResult search(String query) {
        long startTime = System.currentTimeMillis();
        
        try {
            logger.info("Starting Gemini search for query: {}", query);
            
            // Build the complete API URL
            String url = apiUrl + "/gemini-1.5-flash-latest:generateContent?key=" + apiKey;
            logger.info("Calling URL: {}", url);
            
            // Create the request body (what we send to Gemini)
            Map<String, Object> requestBody = createRequestBody(query);
            
            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            // Create the HTTP request
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            // Make the actual API call
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            
            long endTime = System.currentTimeMillis();
            long responseTime = endTime - startTime;
            
            if (response.getStatusCode() == HttpStatus.OK) {
                logger.info("Gemini API call successful. Response time: {}ms", responseTime);
                return parseResponse(response.getBody(), responseTime);
            } else {
                logger.error("Gemini API returned status: {}", response.getStatusCode());
                return createErrorResult("API returned status: " + response.getStatusCode(), responseTime);
            }
            
        } catch (Exception e) {
            long endTime = System.currentTimeMillis();
            long responseTime = endTime - startTime;
            logger.error("Error calling Gemini API: {}", e.getMessage(), e);
            return createErrorResult("Error: " + e.getMessage(), responseTime);
        }
    }
    
    /**
     * Creates the request body for Gemini API
     * This is the format that Gemini expects
     */
    private Map<String, Object> createRequestBody(String query) {
        Map<String, Object> requestBody = new HashMap<>();
        
        // Create the text part
        Map<String, Object> part = new HashMap<>();
        part.put("text", "Please provide a comprehensive answer to: " + query);
        
        // Create the content structure
        Map<String, Object> content = new HashMap<>();
        content.put("parts", List.of(part));
        
        // Add content to request
        requestBody.put("contents", List.of(content));
        
        // Optional: Configure how Gemini generates the response
        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("temperature", 0.7);  // Creativity level (0-1)
        generationConfig.put("topK", 40);          // Consider top 40 tokens
        generationConfig.put("topP", 0.95);        // Probability threshold
        generationConfig.put("maxOutputTokens", 1024);  // Maximum response length
        requestBody.put("generationConfig", generationConfig);
        
        return requestBody;
    }
    
    /**
     * Parses the response from Gemini API
     * Extracts the actual text response from Gemini's JSON format
     */
    private ProviderResult parseResponse(String responseBody, long responseTime) {
        try {
            logger.info("Parsing Gemini response: {}", responseBody);
            
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode candidates = root.get("candidates");
            
            if (candidates != null && candidates.isArray() && candidates.size() > 0) {
                JsonNode firstCandidate = candidates.get(0);
                JsonNode content = firstCandidate.get("content");
                
                if (content != null) {
                    JsonNode parts = content.get("parts");
                    if (parts != null && parts.isArray() && parts.size() > 0) {
                        String text = parts.get(0).get("text").asText();
                        
                        logger.info("Successfully parsed Gemini response");
                        return ProviderResult.builder()
                                .provider("gemini")
                                .text(text)  // FIXED: Changed from .response() to .text()
                                .success(true)
                                .responseTime(responseTime)
                                .build();
                    }
                }
            }
            
            logger.error("Unexpected response structure from Gemini API");
            return createErrorResult("Unexpected response structure", responseTime);
            
        } catch (Exception e) {
            logger.error("Error parsing Gemini response: {}", e.getMessage(), e);
            return createErrorResult("Error parsing response: " + e.getMessage(), responseTime);
        }
    }
    
    /**
     * Creates an error result when something goes wrong
     */
    private ProviderResult createErrorResult(String errorMessage, long responseTime) {
        return ProviderResult.builder()
                .provider("gemini")
                .text("Error: " + errorMessage)  // FIXED: Changed from .response() to .text()
                .success(false)
                .responseTime(responseTime)
                .error(errorMessage)  // FIXED: Changed from .errorMessage() to .error()
                .build();
    }
}