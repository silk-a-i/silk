import chalk from 'chalk';
import { loadConfig } from '../lib/config/load.js';
import { Logger } from '../lib/logger.js';
import { PROVIDERS } from '../lib/constants.js';

export async function infoCommand() {
  const logger = new Logger();
  
  try {
    const config = await loadConfig();
    const provider = Object.values(PROVIDERS).find(p => p.value === config.provider);

    logger.stats('Configuration', [
      { label: 'Provider', value: provider?.displayName || config.provider },
      { label: 'Model', value: config.model },
      { label: 'Base URL', value: config.baseUrl }
    ]);

  } catch (error) {
    logger.error(`Failed to load configuration: ${error.message}`);
    process.exit(1);
  }
}
