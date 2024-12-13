import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DEFAULT_CONFIG = {
  baseUrl: 'http://localhost:11434/v1',
  apiKey: 'sk-dummy-key',
  model: 'llama3.1',
  provider: 'ollama'
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

    // Try to load config file
    let fileConfig = {};
    try {
      const configContent = await fs.readFile('.silk.json', 'utf-8');
      fileConfig = JSON.parse(configContent);
    } catch (error) {
      // Ignore file not found errors
    }

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