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
public class SearchResponse {
    private String query;                    // Original search query
    private List<ProviderResult> results;    // Results from all AI providers
    private int totalProviders;              // How many AI providers were called
    private long timestamp;                  // When the search was performed
}