import inquirer from 'inquirer';
import chalk from 'chalk';
import { createConfig } from '../lib/config/create.js';
import { validateConfig } from '../lib/validation.js';
import { Logger } from '../lib/logger.js';
import { PROVIDERS } from '../lib/constants.js';

export async function initCommand() {
  const logger = new Logger();

  try {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'provider',
        message: 'Select your AI provider:',
        choices: Object.entries(PROVIDERS).map(([key, provider]) => ({
          name: provider.displayName,
          value: key // Use the key (OLLAMA, OPENAI, etc.) instead of provider.name
        }))
      },
      {
        type: 'input',
        name: 'apiKey',
        message: 'Enter your API key:',
        when: (answers) => PROVIDERS[answers.provider].requiresApiKey,
        default: (answers) => PROVIDERS[answers.provider].requiresApiKey ? undefined : 'sk-dummy-key'
      },
      {
        type: 'input',
        name: 'model',
        message: 'Enter the model name:',
        default: (answers) => PROVIDERS[answers.provider].defaultModel
      }
    ]);

    const provider = PROVIDERS[answers.provider];
    
    const config = {
      baseUrl: provider.baseUrl,
      model: answers.model,
      apiKey: answers.apiKey || 'sk-dummy-key',
      provider: provider.value
    };

    // Validate the configuration
    validateConfig(config);

    // Create the configuration files
    await createConfig(config);

    logger.success('Configuration created successfully!');
    logger.info('\nYou can now use Silk with the following commands:');
    logger.info(chalk.cyan('\n  silk do "create a hello world program"'));
    logger.info(chalk.cyan('  silk chat'));
    
  } catch (error) {
    logger.error(`Failed to initialize: ${error.message}`);
    process.exit(1);
  }
}
