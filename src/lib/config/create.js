import fs from 'fs/promises';
import path from 'path';
import { Logger } from '../logger.js';

const logger = new Logger();

export async function createConfig(config) {
  try {
    // Create .silk directory
    await fs.mkdir('.silk', { recursive: true });
    
    // Create .silk/config.json
    const configPath = path.join('.silk', 'config.json');
    const silkConfig = config

    await fs.writeFile(
      configPath,
      JSON.stringify(silkConfig, null, 2)
    );
    
    logger.info(`Created ${configPath}`);

  } catch (error) {
    throw new Error(`Failed to create configuration: ${error.message}`);
  }
}
