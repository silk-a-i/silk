import { loadConfig } from '../config.js';
import { AIResponseStream } from './stream.js';

export class AIClient {
  constructor() {
    this.config = loadConfig();
  }

  async createCompletion({ messages }) {
    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages,
          stream: true,
          temperature: 0,
          // max_tokens: 2000,
          num_ctx: 8 * 1024
        })
      });

      if (!response.ok) {
        throw new Error(`AI request failed: ${response.statusText}`);
      }

      return new AIResponseStream(response);
    } catch (error) {
      throw new Error(`AI completion failed: ${error.message}`);
    }
  }
}

let client = null;

export function getAIClient() {
  if (!client) {
    client = new AIClient();
  }
  return client;
}