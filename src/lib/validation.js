import { PROVIDERS } from './constants.js';

export function validatePrompt(prompt) {
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('Prompt must be a non-empty string');
  }
  if (prompt.length > 4096) {
    throw new Error('Prompt exceeds maximum length of 4096 characters');
  }
  return prompt.trim();
}

export function validateConfig(config) {
  const requiredFields = ['baseUrl', 'model', 'provider'];
  
  for (const field of requiredFields) {
    if (!config[field]) {
      throw new Error(`${field} is required in configuration`);
    }
  }

  // Find provider by value
  const provider = Object.values(PROVIDERS).find(p => p.value === config.provider);
  if (!provider) {
    throw new Error(`Invalid provider: ${config.provider}`);
  }

  // Validate provider-specific requirements
  if (provider.requiresApiKey && !config.apiKey) {
    throw new Error(`API key is required for ${provider.name}`);
  }

  // Validate URL format
  try {
    new URL(config.baseUrl);
  } catch {
    throw new Error('Invalid base URL format');
  }

  return true;
}
