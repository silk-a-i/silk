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
      'x-api-key': this.config.apiKey,
    };

    if (provider.value === 'anthropic') headers['anthropic-version'] = '2023-06-01';

    const body = this.formatRequestBody(messages, provider);

    const url = `${this.config.baseUrl}${provider.endpoint}`
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`AI request failed (${response.status}): ${(await response.text()).slice(0, 500)}`);
    }
    return new AIResponseStream(response, provider.value);
  }

  formatRequestBody(messages, provider) {
    const base = {
      model: this.config.model,
      stream: true,
      temperature: this.config.temperature || 0,
      max_tokens: this.config.max_tokens || 2 * 1024,
    };

    switch(provider.value) {
      case 'anthropic':
        const system = messages.find(m => m.role === 'system')?.content || '';
        const lastUser = messages.filter(m => m.role === 'user').pop();
        return { ...base, messages: [{ role: 'user', content: lastUser.content }], system };
      
      case 'openai':
        return { ...base, messages };
      
      default: // ollama
        return { ...base, messages };
    }
  }
}
