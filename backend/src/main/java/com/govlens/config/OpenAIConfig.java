package com.govlens.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenAIConfig {

    @Value("${govlens.openai.api-key:}")
    private String apiKey;

    @Value("${govlens.openai.model:gpt-4}")
    private String model;

    @Value("${govlens.openai.max-tokens:300}")
    private int maxTokens;

    public String getApiKey() { return apiKey; }
    public String getModel() { return model; }
    public int getMaxTokens() { return maxTokens; }
    public boolean isConfigured() { return apiKey != null && !apiKey.isBlank(); }
}
