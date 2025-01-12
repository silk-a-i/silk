import { loadConfig } from '../lib/config/load.js'
import { Log, Logger } from '../lib/logger.js'
import { PROVIDERS } from '../lib/constants.js'
import { FileStats } from '../lib/stats.js'
import { CommandOptions } from '../lib/CommandOptions.js'
import { getContext } from '../lib/getContext.js'

// function to display only start and end of the key
function safeKey(key) {
  return key.slice(0, 5) + '...' + key.slice(-5)
}

export function logConfiguration(config, logger = new Logger()) {
  const provider = Object.values(PROVIDERS).find(p => p.value === config.provider)

  logger.stats('Configuration', [
    { label: 'Config', value: config.configPath },
    { label: 'Provider', value: provider?.displayName || config.provider },
    { label: 'Model', value: config.model },
    { label: 'Key', value: safeKey(config.apiKey) },
    { label: 'Base URL', value: config.baseUrl },
    { label: 'Include', value: config.include },
    { label: 'Ignore', value: config.ignore },
    { label: 'Root', value: config.root },
    { label: 'Context', value: config.context },
    { label: 'Working directory', value: config.cwd },
    { label: 'Tools', value: config.tools },
    { label: 'Max tokens', value: config.max_tokens || 'N/A' }
  ])
}

export async function info(options = {}) {
  const logger = new Logger({
    verbose: options.verbose || true
  })
  Log.verbose = options.verbose || false

  const config = await loadConfig(new CommandOptions(options))
  
  if(options.json) {
    new Logger().json(config)
    return
  }

  // @todo also support info on files
  const files = await getContext(config)
  // if(options.json) {
  //   const obj = JSON.stringify(files, null, 2)
  //   console.log(obj)
  //   return
  // }

  logConfiguration(config, logger)
  
  const stats = new FileStats()
  files.forEach(file => stats.addFile(file.path, file))
  stats.summary()
}
