import { CommandHandler } from '../lib/CommandHandler.js';
import { loadConfig } from '../lib/config/load.js';
import { logConfiguration } from './info.js';

export async function doCommand(promptOrFile, options = {}) {
  const config = await loadConfig({ config: options.config });

  const handler = new CommandHandler({ 
    ...config,
    ...options, 
  });
  logConfiguration(config, handler.logger);

  return handler.execute(promptOrFile);
}
