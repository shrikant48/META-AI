package com.allai.meta_ai_backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Source {
    private String title;    // Title of the web page/article
    private String url;      // URL of the source
}