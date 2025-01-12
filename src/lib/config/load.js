import { CommandOptions } from '../CommandOptions.js'
import { Log } from '../logger.js'
import { Config } from './Config.js'

export async function loadConfig (options = new CommandOptions()) {
  Log.debug(options)
  try {
    return await new Config(options).load(options.config)
  } catch (error) {
    throw new Error(`Error loading config - ${error.message}`)
  }
}
