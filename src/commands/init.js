import inquirer from 'inquirer';
import chalk from 'chalk';
import { createConfig } from '../lib/config/create.js';
import { Logger } from '../lib/logger.js';
import { INIT_PROViDERS as PROVIDERS } from '../lib/constants.js';
import fs from 'fs';
import path from 'path';

export async function initCommand(root) {
  const logger = new Logger();

  try {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'root',
        message: 'Project directory:',
        default: root || '.',
        validate: input => {
          if (!input) return 'Directory is required';
          return true;
        }
      },
      {
        type: 'list',
        name: 'provider',
        message: 'Select your AI provider:',
        choices: [
          ...Object.entries(PROVIDERS).map(([key, provider]) => ({
            name: provider.displayName,
            value: key
          })),
          { name: 'Other (manual config)', value: 'other' }
        ]
      },
      {
        type: 'input',
        name: 'apiKey',
        message: 'Enter your API key:',
        when: (answers) => answers.provider !== 'other' && PROVIDERS[answers.provider]?.requiresApiKey,
        default: (answers) => PROVIDERS[answers.provider]?.requiresApiKey ? undefined : 'sk-dummy-key'
      },
      {
        type: 'list',
        name: 'model',
        message: 'Select the model:',
        when: (answers) => answers.provider !== 'other',
        choices: (answers) => {
          const provider = PROVIDERS[answers.provider];
          return provider.models?.map(m => ({
            name: m.displayName || m.name,
            value: m.name
          })) || [provider.defaultModel];
        }
      }
    ]);

    const projectDir = path.resolve(answers.root);
    fs.mkdirSync(projectDir, { recursive: true });

    if (answers.provider === 'other') {
      logger.info('\nPlease manually configure your provider in .silk/config.json');
      answers.model = 'openai/gpt-3.5-turbo';
      answers.apiKey = 'sk-dummy-key';
    }

    const config = {
      apiKey: answers.apiKey || 'sk-dummy-key',
      model: answers.model,
      root: answers.root
    };

    const configPath = await createConfig(config);

    logger.success('Configuration created successfully!');
    logger.success(configPath);
    logger.info('\nYou can now use Silk with the following commands:');
    logger.info(chalk.cyan('\n  silk do "create a hello world program"'));
    logger.info(chalk.cyan('  silk chat'));

  } catch (error) {
    logger.error(`Failed to initialize: ${error.message}`);
    process.exit(1);
  }
}
