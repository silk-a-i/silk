import fs from 'fs/promises'
import path from 'path'
import dotenv from 'dotenv'
import { PROVIDERS, DEFAULT_PROVIDER } from '../constants.js'
import { homedir } from 'os'

export const configDir = path.join(homedir(), '.config', 'silk')

export class Config {
  static DEFAULT_CONFIG = {
    apiKey: '',
    model: DEFAULT_PROVIDER.defaultModel,
    provider: DEFAULT_PROVIDER.value,
    models: [],
    include: ['**/*']
  }

  baseUrl = ''
  configPath = ''
  globalConfigPath = ''
  api = {
    baseUrl: '',
    endpoint: ''
  }

  max_tokens = null
  provider = ''
  env = {}
  model = ''
  include = []
  tools = []
  additionalTools = []
  output = ''
  root = ''
  cwd = ''
  verbose = false
  projects = []
  
  constructor (obj = {}) {
    Object.assign(this, obj)
  }

  async load (path = '') {
    const envConfig = this.loadEnvConfig()
    const configFile = await this.findConfigFile(process.cwd(), path)
    const fileConfig = await this.loadConfigFile(configFile)
    const config = this.mergeConfigs(Config.DEFAULT_CONFIG, envConfig, fileConfig)
    this.configPath = configFile?.path || ''
    const validatedConfig = this.validate(config)
    return validatedConfig
  }

  validate (config = {}) {
    // handle 'provider/model' shorthand
    if (config.model && config.model.includes('/')) {
      const [provider, model] = config.model.split('/')
      config.provider = provider
      config.model = model
    }

    // const provider = config.provider?.toUpperCase() || DEFAULT_PROVIDER.value;
    const validatedConfig = this.validateProvider(config)
    const provider = Object.values(PROVIDERS).find(p => p.value === config.provider)

    Object.assign(this, {
      logger: {
        verbose: validatedConfig.verbose
      },
      ...provider,
      cwd: process.cwd(),
      model: validatedConfig.model || provider?.defaultModel,
      api: {
        baseUrl: validatedConfig.baseUrl || provider?.baseUrl,
        endpoint: validatedConfig.endpoint || provider?.endpoint
      },
      ...validatedConfig
    })

    if (!this.apiKey) {
      const envKey = PROVIDERS[this.provider.toUpperCase()].envKey
      const hasKey = this.env[envKey]
      this.apiKey = hasKey
    }
    return this
  }

  loadEnvConfig () {
    const env = dotenv.config({
      path: ['.env', path.join(configDir, '.env')]
    })

    return {
      // apiKey: process.env.SILK_API_KEY,
      model: process.env.SILK_MODEL,
      env: env.parsed
    }
  }

  async findConfigFileFromPath (configPath) {
    const configPaths = [
      { path: path.join(configPath, 'config.js'), type: 'js' },
      { path: path.join(configPath, 'config.mjs'), type: 'js' },
      { path: path.join(configPath, 'config.json'), type: 'json' }
    ]
    for (const config of configPaths) {
      if (await this.fileExists(config.path)) {
        return config
      }
    }
    return null
  }

  async findConfigFile (startDir = '', configPath = '') {
    if (configPath) {
      return this.findConfigFileByPath(configPath)
    }

    const projectConfigFile = await this.findProjectConfigFile(startDir)
    if (projectConfigFile) {
      return projectConfigFile
    }

    return this.findConfigFileFromPath(configDir)
  }

  async findConfigFileByPath (configPath) {
    const fullPath = path.resolve(configPath)
    if (await this.fileExists(fullPath)) {
      return {
        path: fullPath,
        type: path.extname(fullPath).slice(1) || 'json'
      }
    }
    throw new Error(`Config file not found: ${configPath}`)
  }

  async findProjectConfigFile (startDir) {
    let currentDir = startDir
    while (currentDir !== path.parse(currentDir).root) {
      const silkDir = path.join(currentDir, '.silk')
      const configFile = await this.findConfigFileFromPath(silkDir)
      if (configFile) {
        return configFile
      }
      currentDir = path.dirname(currentDir)
    }
    return null
  }

  async loadConfigFile (configFile) {
    if (!configFile) return {}

    const content = await fs.readFile(configFile.path, 'utf-8')

    switch (configFile.type) {
      case 'js':
        // @todo when importing from another 'commonjs' package this fails.
        const module = await import(configFile.path)
        return module.default
      default:
        return JSON.parse(content)
    }
  }

  async fileExists (filePath) {
    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }

  mergeConfigs (...configs) {
    return configs.reduce((acc, config) => {
      return {
        ...acc,
        ...Object.fromEntries(Object.entries(config).filter(([_, v]) => v !== undefined))
      }
    }, {})
  }

  validateProvider (config) {
    const provider = Object.values(PROVIDERS).find(p => p.value === config.provider)

    if (!provider) {
      console.warn(`Warning: Invalid provider '${config.provider}', using default`)
      return {
        ...config,
        provider: DEFAULT_PROVIDER.value,
        baseUrl: DEFAULT_PROVIDER.baseUrl,
        model: DEFAULT_PROVIDER.defaultModel
      }
    }

    if (!config.models?.length) {
      config.models = provider.models?.map(m => m.name) || [provider.defaultModel]
    }

    return config
  }
}
