import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { PROVIDERS, DEFAULT_PROVIDER } from '../constants.js';

const DEFAULT_CONFIG = {
  baseUrl: DEFAULT_PROVIDER.baseUrl,
  apiKey: 'sk-dummy-key',
  model: DEFAULT_PROVIDER.defaultModel,
  provider: DEFAULT_PROVIDER.value,
  include: []
};

async function findConfigFile(startDir) {
  let currentDir = startDir;

  while (currentDir !== path.parse(currentDir).root) {
    const silkDir = path.join(currentDir, '.silk');
    const configPath = path.join(silkDir, 'config.json');
    const fallbackPath = path.join(currentDir, '.silk.json');

    if (await fileExists(configPath)) return configPath;
    if (await fileExists(fallbackPath)) return fallbackPath;

    currentDir = path.dirname(currentDir);
  }

  return null;
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function getEnvConfig() {
  dotenv.config();

  return {
    baseUrl: process.env.SILK_BASE_URL,
    apiKey: process.env.SILK_API_KEY,
    model: process.env.SILK_MODEL,
    provider: process.env.SILK_PROVIDER,
    include: process.env.SILK_INCLUDE ? process.env.SILK_INCLUDE.split(',') : undefined
  };
}

function mergeConfigs(...configs) {
  return configs.reduce((acc, config) => {
    return {
      ...acc,
      ...Object.fromEntries(Object.entries(config).filter(([_, v]) => v !== undefined))
    };
  }, {});
}

function validateProvider(config) {
  const provider = Object.values(PROVIDERS).find(p => p.value === config.provider);

  if (!provider) {
    console.warn(`Warning: Invalid provider '${config.provider}', using default`);
    return {
      ...config,
      provider: DEFAULT_PROVIDER.value,
      baseUrl: DEFAULT_PROVIDER.baseUrl,
      model: DEFAULT_PROVIDER.defaultModel
    };
  }

  return config;
}

export async function loadConfig() {
  try {
    const envConfig = getEnvConfig();
    const configPath = await findConfigFile(process.cwd());
    const fileConfig = configPath ? JSON.parse(await fs.readFile(configPath, 'utf-8')) : {};

    const config = mergeConfigs(DEFAULT_CONFIG, fileConfig, envConfig);
    return validateProvider(config);
  } catch (error) {
    console.warn(`Warning: Error loading config - ${error.message}`);
    return DEFAULT_CONFIG;
  }
}
