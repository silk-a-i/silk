import { loadConfig } from '../lib/config/load.js'
import { Log, Logger } from '../lib/logger.js'
import { CommandOptions } from '../options.js'
import { logConfiguration } from './info.js'

export function installConfigCommand(program) {
  program
    .command('config')
    .option('--json', 'json')
    .description('Show current configuration')
    .action(configCommand)
}

export async function configCommand(options = {}) {
  const logger = new Logger({
    verbose: options.verbose || true
  })
  Log.verbose = options.verbose || false

  const config = await loadConfig(new CommandOptions(options))
  
  const isCliOutput = !options.json
  if(options.json) {
    new Logger().json({
      config,
    })
    return
  }

  if(isCliOutput) {
    logConfiguration(config, logger)
  }
}
