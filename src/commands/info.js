import { loadConfig } from '../lib/config/load.js';
import { Logger } from '../lib/logger.js';
import { PROVIDERS } from '../lib/constants.js';
import { gatherContextInfo } from '../lib/utils.js';
import { FileStats, formatBytes } from '../lib/stats.js';

export function logConfiguration(config, logger) {
  const provider = Object.values(PROVIDERS).find(p => p.value === config.provider);

  logger.stats('Configuration', [
    { label: 'Provider', value: provider?.displayName || config.provider },
    { label: 'Model', value: config.model },
    { label: 'Base URL', value: config.baseUrl },
    { label: 'include', value: config.include },
    { label: 'max_tokens', value: config.max_tokens }
  ]);
}

export async function infoCommand(options) {
  const logger = new Logger();
  
  try {
    const config = await loadConfig();
    logConfiguration(config, logger);

    // Add file stats using gatherContextInfo
    const files = await gatherContextInfo(config.include || '**/*', options);
    const stats = new FileStats();
    files.forEach(file => stats.addFile(file.path, null, file)); // Use size directly
    stats.getSummary(logger);

  } catch (error) {
    logger.error(`Failed to load configuration: ${error.message}`);
    process.exit(1);
  }
}
