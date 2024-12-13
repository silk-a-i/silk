import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Logger } from '../logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logger = new Logger();

export async function createConfig(config) {
  try {
    // Create .silk.json
    await createSilkJson(config);
    
    // Create .env with environment variables
    // await createEnvFile(config);
    
    // Create .gitignore if it doesn't exist
    // await createGitignore();
    
  } catch (error) {
    throw new Error(`Failed to create configuration: ${error.message}`);
  }
}

async function createSilkJson(config) {
  const silkConfig = {
    baseUrl: config.baseUrl,
    model: config.model,
    apiKey: config.apiKey,
    provider: config.provider
  };

  const path = '.silk/config.json'

  // make sure the directory exists
  await fs.mkdir('.silk', { recursive: true });
  await fs.writeFile(
    path,
    JSON.stringify(silkConfig, null, 2)
  );
  
  logger.info(`Created ${path}`);
}

async function createEnvFile(config) {
  const envContent = `# Silk Configuration
SILK_BASE_URL=${config.baseUrl}
SILK_API_KEY=${config.apiKey}
SILK_MODEL=${config.model}
SILK_PROVIDER=${config.provider}`;

  await fs.writeFile('.env', envContent);
  logger.info('Created .env');
}

async function createGitignore() {
  try {
    await fs.access('.gitignore');
  } catch {
    const gitignoreContent = `# Silk configuration
.env
.silk.json

# Dependencies
node_modules/
`;
    await fs.writeFile('.gitignore', gitignoreContent);
    logger.info('Created .gitignore');
  }
}