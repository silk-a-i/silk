export const PROVIDERS = {
  SILK: {
    name: 'Silk',
    value: 'silk',
    baseUrl: 'https://api.silk-labs.com/v1/chat',
    defaultModel: 'silk',
    endpoint: '',
    models: [
      { name: 'silk-fast', displayName: 'Silk Fast' },
      { name: 'silk-smart', displayName: 'Silk Smart' }
    ]
  },
  OLLAMA: {
    name: 'Ollama (Local)',
    value: 'ollama',
    baseUrl: 'http://localhost:11434/v1',
    defaultModel: 'llama3.1',
    requiresApiKey: false,
    endpoint: '/chat/completions'
  },
  OPENAI: {
    name: 'OpenAI',
    value: 'openai',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-3.5-turbo',
    requiresApiKey: true,
    endpoint: '/chat/completions'
  },
  ANTHROPIC: {
    name: 'Anthropic',
    value: 'anthropic',
    baseUrl: 'https://api.anthropic.com/v1',
    requiresApiKey: true,
    displayName: 'Anthropic',
    website: 'https://docs.anthropic.com/en/docs/about-claude/models',
    endpoint: '/messages',
    models: [
      { name: 'claude-3-5-sonnet-20241022' },
      { name: 'claude-3-5-haiku-20241022' }
    ]
  }
};

export const INIT_PROViDERS = [PROVIDERS.SILK, PROVIDERS.OLLAMA, PROVIDERS.OPENAI];
export const DEFAULT_PROVIDER = PROVIDERS.OLLAMA;
