import { CommandHandler } from '../lib/CommandHandler.js';
import { loadConfig } from '../lib/config/load.js';
import { logConfiguration } from './info.js';

export async function doCommand(promptOrFile, options = {}) {
  const handler = new CommandHandler(options);

  const config = await loadConfig();
  logConfiguration(config, handler.logger);

  return handler.execute(promptOrFile, { ...options, ...config });
}
