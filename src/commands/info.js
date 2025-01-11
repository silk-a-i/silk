import { loadConfig } from '../lib/config/load.js'
import { Logger } from '../lib/logger.js'
import { PROVIDERS } from '../lib/constants.js'
import { gatherContextInfo } from '../lib/fs.js'
import { FileStats } from '../lib/stats.js'
import { CommandOptions } from '../lib/CommandOptions.js'
import { getContext } from '../lib/getContext.js'

export function logConfiguration(config, logger = new Logger()) {
  const provider = Object.values(PROVIDERS).find(p => p.value === config.provider)

  logger.stats('Configuration', [
    { label: 'Config', value: config.configPath },
    { label: 'Provider', value: provider?.displayName || config.provider },
    { label: 'Model', value: config.model },
    { label: 'Base URL', value: config.baseUrl },
    { label: 'include', value: config.include },
    { label: 'root', value: config.root },
    { label: 'max_tokens', value: config.max_tokens || 'N/A' }
  ])
}

export async function info(options = {}) {
  const logger = new Logger({
    verbose: options.verbose || true
  })

  try {
    const config = await loadConfig(new CommandOptions(options))
    
    const files = await getContext(config)
    if(options.json) {
      const obj = JSON.stringify(files, null, 2)
      console.log(obj)
      return
    }

    logConfiguration(config, logger)
    const stats = new FileStats()
    files.forEach(file => stats.addFile(file.path, file))
    stats.summary()
  } catch (error) {
    logger.error(`Failed to load configuration: ${error.message}`)
    process.exit(1)
  }
}
