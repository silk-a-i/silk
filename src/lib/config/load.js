import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { PROVIDERS, DEFAULT_PROVIDER } from '../constants.js';

const DEFAULT_CONFIG = {
  baseUrl: DEFAULT_PROVIDER.baseUrl,
  apiKey: 'sk-dummy-key',
  model: DEFAULT_PROVIDER.defaultModel,
  provider: DEFAULT_PROVIDER.value
};

export async function loadConfig() {
  try {
    // Load environment variables
    dotenv.config();

    // Check for environment variables
    const envConfig = {
      baseUrl: process.env.SILK_BASE_URL,
      apiKey: process.env.SILK_API_KEY,
      model: process.env.SILK_MODEL,
      provider: process.env.SILK_PROVIDER
    };

    // Try to load config file from .silk/config.json
    let fileConfig = {};
    try {
      const configPath = path.join(process.cwd(), '.silk', 'config.json');
      const configContent = await fs.readFile(configPath, 'utf-8');
      fileConfig = JSON.parse(configContent);
    } catch (error) {
      // Try fallback to .silk.json in root if .silk/config.json doesn't exist
      try {
        const fallbackPath = path.join(process.cwd(), '.silk.json');
        const configContent = await fs.readFile(fallbackPath, 'utf-8');
        fileConfig = JSON.parse(configContent);
      } catch {
        // Ignore file not found errors
      }
    }

    // Merge configs with precedence: env > file > default
    const config = {
      ...DEFAULT_CONFIG,
      ...fileConfig,
      ...Object.fromEntries(
        Object.entries(envConfig).filter(([_, v]) => v !== undefined)
      )
    };

    // Validate provider
    const provider = Object.values(PROVIDERS).find(p => p.value === config.provider);
    if (!provider) {
      console.warn(`Warning: Invalid provider '${config.provider}', using default`);
      config.provider = DEFAULT_PROVIDER.value;
      config.baseUrl = DEFAULT_PROVIDER.baseUrl;
      config.model = DEFAULT_PROVIDER.defaultModel;
    }

    return config;
  } catch (error) {
    console.warn(`Warning: Error loading config - ${error.message}`);
    return DEFAULT_CONFIG;
  }
}
