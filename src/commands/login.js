import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import { homedir } from 'os';
import { Logger } from '../lib/logger.js';

export async function loginCommand(options = {}) {
  options.interactive = options.interactive || true

  const logger = new Logger({
    verbose: true,
    ...options
  });
  const configDir = path.join(homedir(), '.config', 'silk');
  const envPath = path.join(configDir, '.env');

  // Create config directory if it doesn't exist
  fs.mkdirSync(configDir, { recursive: true });

  if (options.interactive) {
    logger.info('Get your API key from https://console.silk-labs.com/');
    const answers = await inquirer.prompt([{
      type: 'input',
      name: 'apiKey',
      message: 'Enter your API key:',
      validate: input => input ? true : 'API key is required'
    }]);
    
    fs.writeFileSync(envPath, `SILK_API_KEY=${answers.apiKey}\n`);
    logger.success(`API key saved successfully to ${envPath}`);
    return;
  }

  logger.info('Get your API key from https://console.silk-labs.com/');
  logger.info(`Then save it to ${envPath}`);
}
