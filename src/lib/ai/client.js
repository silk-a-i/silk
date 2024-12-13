import { AIResponseStream } from './stream.js';
import { PROVIDERS } from '../constants.js';

export class AIClient {
  constructor(config) {
    if (!config) {
      throw new Error('Config is required for AIClient');
    }
    this.config = config;
  }

  async createCompletion({ messages }) {
    try {
      const provider = Object.values(PROVIDERS).find(p => p.value === this.config.provider);
      
      if (!provider) {
        throw new Error(`Invalid provider: ${this.config.provider}`);
      }

      const headers = {
        'Content-Type': 'application/json'
      };

      // Add provider-specific headers
      if (provider.requiresApiKey) {
        if (provider.value === 'anthropic') {
          headers['x-api-key'] = this.config.apiKey;
          headers['anthropic-version'] = '2023-06-01';
        } else {
          headers['Authorization'] = `Bearer ${this.config.apiKey}`;
        }
      }

      const body = this.formatRequestBody(messages, provider);

      const response = await fetch(`${this.config.baseUrl}${provider.endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`AI request failed (${response.status}): ${error}`);
      }

      return new AIResponseStream(response, provider.value);
    } catch (error) {
      throw new Error(`AI completion failed: ${error.message}`);
    }
  }

  formatRequestBody(messages, provider) {
    const baseBody = {
      model: this.config.model,
      stream: true,
      temperature: 0
    };

    switch (provider.value) {
      case 'anthropic':
        // Convert messages to Anthropic format
        const systemMessage = messages.find(m => m.role === 'system')?.content || '';
        const userMessages = messages.filter(m => m.role === 'user');
        const lastUserMessage = userMessages[userMessages.length - 1];
        
        return {
          ...baseBody,
          messages: [{
            role: 'user',
            content: lastUserMessage.content,
          }],
          system: systemMessage,
          max_tokens: 4096
        };
      
      case 'openai':
        return {
          ...baseBody,
          messages,
          max_tokens: 4096
        };
      
      case 'ollama':
      default:
        return {
          ...baseBody,
          messages,
          num_ctx: 8 * 1024
        };
    }
  }
}

let client = null;

export async function getAIClient(config) {
  if (!client || config) {
    client = new AIClient(config);
  }
  return client;
}
