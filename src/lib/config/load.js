import { CommandOptions } from '../CommandOptions.js'
import { Config } from './Config.js'

export async function loadConfig (options = new CommandOptions()) {
  try {
    return {
      ...new CommandOptions(),
      // Load the default config
      ...await new Config().load(options.config),
      // Override with any options passed in
      ...options
    }
  } catch (error) {
    throw new Error(`Error loading config - ${error.message}`)
  }
}
