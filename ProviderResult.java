package com.allai.meta_ai_backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProviderResult {
    private String provider;          // e.g., "gemini", "chatgpt"
    private String text;              // The AI's response text
    private List<Source> sources;     // Web sources (if any)
    private String error;             // Error message if failed
    private boolean success;          // Whether the call succeeded
    private long responseTime;        // Time taken in milliseconds
    private Long latencyMs;           // Frontend expects this field
    
    // Custom getter to provide latencyMs from responseTime if not set
    public Long getLatencyMs() {
        if (latencyMs != null && latencyMs > 0) {
            return latencyMs;
        }
        return responseTime;
    }
    
    // Custom setter to sync both fields
    public void setResponseTime(long responseTime) {
        this.responseTime = responseTime;
        if (this.latencyMs == null) {
            this.latencyMs = responseTime;
        }
    }
}