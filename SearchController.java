package com.allai.meta_ai_backend.controller;

import com.allai.meta_ai_backend.model.ProviderResult;
import com.allai.meta_ai_backend.model.SearchRequest;
import com.allai.meta_ai_backend.model.SearchResponse;
import com.allai.meta_ai_backend.service.AiSearchService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")  // All endpoints will start with /api
@CrossOrigin(origins = "http://localhost:3000")  // Allow frontend to call this
public class SearchController {
    
    private static final Logger logger = LoggerFactory.getLogger(SearchController.class);
    
    @Autowired
    private AiSearchService aiSearchService;
    
    /**
     * Main search endpoint - searches across all AI providers
     * Frontend will call: POST http://localhost:8080/api/search
     * With JSON body: {"query": "What is AI?"}
     */
    @PostMapping("/search")
    public ResponseEntity<SearchResponse> search(@RequestBody SearchRequest request) {
        try {
            logger.info("Received search request: {}", request.getQuery());
            
            if (request.getQuery() == null || request.getQuery().trim().isEmpty()) {
                logger.error("Empty query received");
                return ResponseEntity.badRequest().build();
            }
            
            SearchResponse response = aiSearchService.searchAllProviders(request.getQuery());
            logger.info("Search completed successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error processing search request: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Test endpoint for Gemini only
     * Useful for testing: POST http://localhost:8080/api/search/gemini
     */
    @PostMapping("/search/gemini")
    public ResponseEntity<ProviderResult> searchGemini(@RequestBody SearchRequest request) {
        try {
            logger.info("Received Gemini-only search request: {}", request.getQuery());
            
            if (request.getQuery() == null || request.getQuery().trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            
            ProviderResult result = aiSearchService.searchGeminiOnly(request.getQuery());
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("Error processing Gemini search request: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Health check endpoint
     * Test with: GET http://localhost:8080/api/health
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        logger.info("Health check requested");
        return ResponseEntity.ok("META-AI Backend is running! ✅");
    }
    
    /**
     * Test endpoint to check if Gemini API key is working
     * Test with: GET http://localhost:8080/api/test-gemini
     */
    @GetMapping("/test-gemini")
    public ResponseEntity<ProviderResult> testGemini() {
        try {
            logger.info("Testing Gemini API connection");
            ProviderResult result = aiSearchService.searchGeminiOnly("Say 'Hello from Gemini!'");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Gemini test failed: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}