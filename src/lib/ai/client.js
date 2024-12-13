import { AIResponseStream } from './stream.js';
import { PROVIDERS } from '../constants.js';

export class AIClient {
  constructor(config) {
    if (!config) throw new Error('Config required');
    this.config = config;
  }

  async createCompletion({ messages }) {
    const provider = Object.values(PROVIDERS).find(p => p.value === this.config.provider);
    if (!provider) throw new Error(`Invalid provider: ${this.config.provider}`);

    const headers = {
      'Content-Type': 'application/json',
      ...(provider.requiresApiKey && {
        [provider.value === 'anthropic' ? 'x-api-key' : 'Authorization']: 
        provider.value === 'anthropic' ? this.config.apiKey : `Bearer ${this.config.apiKey}`
      })
    };

    if (provider.value === 'anthropic') headers['anthropic-version'] = '2023-06-01';

    const response = await fetch(`${this.config.baseUrl}${provider.endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(this.formatRequestBody(messages, provider))
    });

    if (!response.ok) throw new Error(`AI request failed (${response.status}): ${await response.text()}`);
    return new AIResponseStream(response, provider.value);
  }

  formatRequestBody(messages, provider) {
    const base = {
      model: this.config.model,
      stream: true,
      temperature: 0
    };

    switch(provider.value) {
      case 'anthropic':
        const system = messages.find(m => m.role === 'system')?.content || '';
        const lastUser = messages.filter(m => m.role === 'user').pop();
        return { ...base, messages: [{ role: 'user', content: lastUser.content }], system, max_tokens: 8 * 1024 };
      
      case 'openai':
        return { ...base, messages, max_tokens: 8 * 1024 };
      
      default: // ollama
        return { ...base, messages, num_ctx: 8 * 1024 };
    }
  }
}
