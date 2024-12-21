import { CommandHandler } from '../lib/CommandHandler.js';
import { CommandOptions } from '../lib/CommandOptions.js';
import { loadConfig } from '../lib/config/load.js';
import { logConfiguration } from './info.js';

export async function doCommand(promptOrFile, options = new CommandOptions) {
  const config = await loadConfig(options)

  const handler = new CommandHandler(config);
  logConfiguration(config, handler.logger);

  return handler.execute(promptOrFile);
}
