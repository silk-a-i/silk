export const SILK_DIR = '.silk';

export const VERSION = '0.0.1-alpha'

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
  }
  // Contact contact@silky.dev to add your providers here
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
