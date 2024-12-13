import dotenv from 'dotenv';

const DEFAULT_CONFIG = {
  baseUrl: 'http://localhost:11434/v1',
  apiKey: 'sk-dummy-key',
  model: 'llama3.1'
};

export function loadConfig() {
  try {
    // Load environment variables
    dotenv.config();

    // Check for environment variables first
    const envConfig = {
      baseUrl: process.env.SILK_BASE_URL,
      apiKey: process.env.SILK_API_KEY,
      model: process.env.SILK_MODEL
    };

    // Try to load config file
    let fileConfig = {};

    // Merge configs with precedence: env > file > default
    return {
      ...DEFAULT_CONFIG,
      ...fileConfig,
      ...Object.fromEntries(
        Object.entries(envConfig).filter(([_, v]) => v !== undefined)
      )
    };
  } catch (error) {
    console.warn(`Warning: Error loading config - ${error.message}`);
    return DEFAULT_CONFIG;
  }
}