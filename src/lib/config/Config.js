import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { PROVIDERS, DEFAULT_PROVIDER } from '../constants.js';

export class Config {
  static DEFAULT_CONFIG = {
    apiKey: 'sk-dummy-key', 
    model: DEFAULT_PROVIDER.defaultModel,
    provider: DEFAULT_PROVIDER.value,
    models: [],
    include: ['**/*']
  };

  async load(path = "") {
    const envConfig = this.loadEnvConfig();
    const configFile = await this.findConfigFile(process.cwd(), path);
    const fileConfig = await this.loadConfigFile(configFile);

    const config = this.mergeConfigs(Config.DEFAULT_CONFIG, fileConfig, envConfig);
    const validatedConfig = this.validateProvider(config);
    
    if (validatedConfig.model && validatedConfig.model.includes('/')) {
      const [provider, model] = validatedConfig.model.split('/');
      validatedConfig.provider = provider;
      validatedConfig.model = model;
    }

    return {
      baseUrl: PROVIDERS[validatedConfig.provider.toUpperCase()].baseUrl,
      ...validatedConfig,
      configPath: configFile?.path
    };
  }

  loadEnvConfig() {
    dotenv.config();
    return {
      apiKey: process.env.SILK_API_KEY,
      model: process.env.SILK_MODEL,
    };
  }

  async findConfigFile(startDir = "", configPath = "") {
    if (configPath) {
      const fullPath = path.resolve(configPath);
      if (await this.fileExists(fullPath)) {
        return {
          path: fullPath,
          type: path.extname(fullPath).slice(1) || 'json'
        };
      }
      throw new Error(`Config file not found: ${configPath}`);
    }

    let currentDir = startDir;
    while (currentDir !== path.parse(currentDir).root) {
      const silkDir = path.join(currentDir, '.silk');
      const configPaths = [
        { path: path.join(silkDir, 'config.js'), type: 'js' },
        { path: path.join(silkDir, 'config.json'), type: 'json' }
      ];

      for (const config of configPaths) {
        if (await this.fileExists(config.path)) {
          return config;
        }
      }

      currentDir = path.dirname(currentDir);
    }

    return null;
  }

  async loadConfigFile(configFile) {
    if (!configFile) return {};

    const content = await fs.readFile(configFile.path, 'utf-8');
    
    switch (configFile.type) {
      case 'js':
        const module = await import(configFile.path);
        return module.default;
      default:
        return JSON.parse(content);
    }
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  mergeConfigs(...configs) {
    return configs.reduce((acc, config) => {
      return {
        ...acc,
        ...Object.fromEntries(Object.entries(config).filter(([_, v]) => v !== undefined))
      };
    }, {});
  }

  validateProvider(config) {
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

    if (!config.models?.length) {
      config.models = provider.models?.map(m => m.name) || [provider.defaultModel];
    }

    return config;
  }
}
