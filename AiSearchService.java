package com.allai.meta_ai_backend.service;

import com.allai.meta_ai_backend.model.ProviderResult;
import com.allai.meta_ai_backend.model.SearchResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class AiSearchService {

    @Autowired
    private GeminiService geminiService;

    /**
     * Handles search requests using Gemini only
     */
    public SearchResponse searchAllProviders(String query) {
        long startTime = System.currentTimeMillis();

        // Call Gemini service
        ProviderResult geminiResult = geminiService.search(query);

        List<ProviderResult> results = new ArrayList<>();
        results.add(geminiResult);

        long totalTime = System.currentTimeMillis() - startTime;

        return SearchResponse.builder()
                .query(query)
                .results(results)
                .totalProviders(1)
                .timestamp(System.currentTimeMillis())
                .build();
    }

    /**
     * Direct Gemini-only search (if needed)
     */
    public ProviderResult searchGeminiOnly(String query) {
        return geminiService.search(query);
    }
}
