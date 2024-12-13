import inquirer from 'inquirer';
import chalk from 'chalk';
import { createConfig } from '../lib/config/create.js';
import { validateConfig } from '../lib/validation.js';
import { Logger } from '../lib/logger.js';

const PROVIDERS = {
  OLLAMA: {
    name: 'Ollama',
    baseUrl: 'http://localhost:11434/v1',
    defaultModel: 'llama3.1'
  },
  OPENAI: {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-3.5-turbo'
  }
};

export async function initCommand() {
  const logger = new Logger();

  try {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'provider',
        message: 'Select your AI provider:',
        choices: [
          { name: 'Ollama (Local)', value: 'OLLAMA' },
          { name: 'OpenAI', value: 'OPENAI' }
        ]
      },
      {
        type: 'input',
        name: 'apiKey',
        message: 'Enter your API key:',
        default: (answers) => answers.provider === 'OLLAMA' ? 'sk-dummy-key' : undefined,
        when: (answers) => answers.provider === 'OPENAI'
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
      provider: answers.provider.toLowerCase()
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