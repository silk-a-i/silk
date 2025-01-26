import { loadConfig } from '../lib/config/load.js'
import { Log, Logger } from '../lib/logger.js'
import { PROVIDERS } from '../lib/constants.js'
import { FileStats } from '../lib/stats.js'
import { CommandOptions } from '../options.js'
import { gatherContextInfo } from '../lib/fs.js'

export function installInfoCommand(program) {
  program
    .command('info')
    .alias('i')
    .option('--json', 'json')
    .description('Show current configuration')
    .action(info)
}

/**
 * function to display only start and end of the key
 * @param {*} key 
 * @returns 
 */
function safeKey(key) {
  return key.slice(0, 5) + '...' + key.slice(-5)
}

export function logConfiguration(config, logger = new Logger()) {
  const provider = Object.values(PROVIDERS).find(p => p.value === config.provider)

  logger.stats('Configuration', [
    { label: 'Config', value: config.configPath },
    { label: 'Config (global)', value: config.globalConfigPath },
    { label: 'Provider', value: provider?.displayName || config.provider },
    { label: 'Model', value: config.model },
    { label: 'Key', value: safeKey(config.apiKey) },
    { label: 'Base URL', value: config.baseUrl },
    { label: 'Include', value: config.include },
    { label: 'Ignore', value: config.ignore },
    { label: 'Root', value: config.root },
    { label: 'Root (absolute)', value: config.absoluteRoot },
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
  
  // @todo support info on files e.g. silk info files
  // const files = await getContext({ 
  //   ...config,
  //   contextMode: CONTEXT_MODES.ALL 
  // })
  const files = await gatherContextInfo(config.include, config)

  const isCliOutput = !options.json
  if(options.json) {
    new Logger().json({
      config,
      files
    })
    return
  }

  if(isCliOutput) {
    const stats = new FileStats()
    files.forEach(file => stats.addFile(file.path, file))
  
    logConfiguration(config, logger)
    stats.summary()
  }
}
