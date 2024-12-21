import { CommandOptions } from '../CommandOptions.js';
import { Config } from './Config.js';

export async function loadConfig(options = new CommandOptions) {
  try {
    return {
      // Load the default config
      ...await new Config().load(options.config),
      // Override with any options passed in
      ...options
    }
  } catch (error) {
    console.warn(`Warning: Error loading config - ${error.message}`);
    return Config.DEFAULT_CONFIG;
  }
}
