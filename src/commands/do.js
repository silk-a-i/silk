import { CommandHandler } from '../lib/CommandHandler.js';
import { CommandOptions } from '../lib/CommandOptions.js';
import { loadConfig } from '../lib/config/load.js';
import { extractPrompt } from '../lib/prompt-extractor.js';
import { logConfiguration } from './info.js';
import path from 'path';

export async function doCommand(promptOrFile, options = new CommandOptions) {
  const config = await loadConfig(options)

  const handler = new CommandHandler(config);
  logConfiguration(config, handler.logger);

  try {
    const configRoot = path.dirname(config.configPath);
    const prompt = await extractPrompt(promptOrFile, configRoot);
    handler.execute(prompt);
  } catch (error) {
    handler.logger.error(error);
  }
}
