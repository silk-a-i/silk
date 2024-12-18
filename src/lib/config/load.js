import { Config } from './Config.js';

export async function loadConfig(options = {}) {
  try {
    return await new Config().load(options);
  } catch (error) {
    console.warn(`Warning: Error loading config - ${error.message}`);
    return Config.DEFAULT_CONFIG;
  }
}
