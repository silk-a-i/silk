import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import yaml from 'yaml';
import { PROVIDERS, DEFAULT_PROVIDER } from '../constants.js';

const DEFAULT_CONFIG = {
  baseUrl: DEFAULT_PROVIDER.baseUrl,
  apiKey: 'sk-dummy-key',
  model: DEFAULT_PROVIDER.defaultModel,
  provider: DEFAULT_PROVIDER.value,
  models: [],
  include: ['**/*']
};

async function findConfigFile(startDir, configPath) {
  // If explicit config path provided, use it
  if (configPath) {
    const fullPath = path.resolve(configPath);
    if (await fileExists(fullPath)) {
      return {
        path: fullPath,
        type: path.extname(fullPath).slice(1) || 'json'
      };
    }
    throw new Error(`Config file not found: ${configPath}`);
  }

  // Otherwise search for config files
  let currentDir = startDir;
  while (currentDir !== path.parse(currentDir).root) {
    const silkDir = path.join(currentDir, '.silk');
    const configPaths = [
      { path: path.join(silkDir, 'config.json'), type: 'json' },
      { path: path.join(silkDir, 'config.js'), type: 'js' },
      { path: path.join(silkDir, 'config.yaml'), type: 'yaml' },
      { path: path.join(silkDir, 'config.yml'), type: 'yaml' },
      { path: path.join(currentDir, '.silk.json'), type: 'json' },
      { path: path.join(currentDir, '.silk.yaml'), type: 'yaml' },
      { path: path.join(currentDir, '.silk.yml'), type: 'yaml' }
    ];

    for (const config of configPaths) {
      if (await fileExists(config.path)) {
        return config;
      }
    }

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
    apiKey: process.env.SILK_API_KEY,
    model: process.env.SILK_MODEL,
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

  // Add default models if none specified
  if (!config.models || !config.models.length) {
    config.models = provider.models?.map(m => m.name) || [provider.defaultModel];
  }

  return config;
}

export async function loadConfig(options = {}) {
  try {
    const envConfig = getEnvConfig();
    const configFile = await findConfigFile(process.cwd(), options.config);
    
    let fileConfig = {};
    if (configFile) {
      const content = await fs.readFile(configFile.path, 'utf-8');
      
      switch (configFile.type) {
        case 'js':
          const module = await import(configFile.path);
          fileConfig = module.default;
          break;
        case 'yaml':
          fileConfig = yaml.parse(content);
          break;
        default:
          fileConfig = JSON.parse(content);
      }
    }

    const config = mergeConfigs(DEFAULT_CONFIG, fileConfig, envConfig);
    const validatedConfig = validateProvider(config);
    
    return {
      ...validatedConfig,
      configPath: configFile?.path
    };
  } catch (error) {
    console.warn(`Warning: Error loading config - ${error.message}`);
    return DEFAULT_CONFIG;
  }
}
