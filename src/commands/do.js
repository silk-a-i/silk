import { CommandHandler } from '../lib/CommandHandler.js';
import { loadConfig } from '../lib/config/load.js';
import { logConfiguration } from './info.js';

export async function doCommand(root, promptOrFile, options = {}) {
  const handler = new CommandHandler(options);

  const config = await loadConfig();
  logConfiguration(config, handler.logger);

  // Handle case when only prompt is provided
  if (!promptOrFile && root) {
    promptOrFile = root;
    root = null;
  }

  return handler.execute(root, promptOrFile, { ...options, config });
}
