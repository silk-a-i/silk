export const PROVIDERS = {
  OLLAMA: {
    name: 'Ollama',
    value: 'ollama',
    baseUrl: 'http://localhost:11434/v1',
    defaultModel: 'llama3.1',
    requiresApiKey: false,
    displayName: 'Ollama (Local)',
    endpoint: '/chat/completions'
  },
  OPENAI: {
    name: 'OpenAI',
    value: 'openai',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-3.5-turbo',
    requiresApiKey: true,
    displayName: 'OpenAI',
    endpoint: '/chat/completions'
  },
  ANTHROPIC: {
    name: 'Anthropic',
    value: 'anthropic',
    baseUrl: 'https://api.anthropic.com/v1',
    defaultModel: 'claude-2',
    requiresApiKey: true,
    displayName: 'Anthropic',
    endpoint: '/messages'
  }
};

export const DEFAULT_PROVIDER = PROVIDERS.OLLAMA;
