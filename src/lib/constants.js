export const PROVIDERS = {
  // @todo better lookup structure. either use value or key of the lookup object not both.
  SILK: {
    name: 'Silk',
    value: 'silk',
    baseUrl: 'https://api.silk-labs.com/v2/chat',
    defaultModel: 'smart',
    requiresApiKey: true,
    keyInfo: 'Get your key at: https://console.silk-labs.com',
    endpoint: '',
    envKey: 'SILK_API_KEY',
    models: [
      { name: 'fast', displayName: 'Fast' },
      { name: 'bright', displayName: 'Bright' },
      { name: 'smart', displayName: 'Smart' },
      { name: 'oracle', displayName: 'Oracle' }
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
    envKey: 'ANTHROPIC_API_KEY',
    website: 'https://docs.anthropic.com/en/docs/about-claude/models',
    endpoint: '/messages',
    models: [
      { name: 'claude-3-5-sonnet-20241022' },
      { name: 'claude-3-5-haiku-20241022' }
    ]
  }
}

export const INIT_PROViDERS = [PROVIDERS.SILK, PROVIDERS.OLLAMA, PROVIDERS.OPENAI]
export const DEFAULT_PROVIDER = PROVIDERS.SILK

export const DEFAULT_IGNORE = [
  'node_modules/**',
  'dist/**',
  'build/**',
  '**/.git',
  'test/**',
  '.silk/**',
  '.env',
  '.DS_Store',
  'yarn.lock',
  'package-lock.json',
  'npm-debug.log',
  'pnpm-lock.yaml'
]
