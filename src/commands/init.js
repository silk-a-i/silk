import inquirer from 'inquirer';
import chalk from 'chalk';
import { createConfig } from '../lib/config/create.js';
import { validateConfig } from '../lib/validation.js';
import { Logger } from '../lib/logger.js';
import { PROVIDERS } from '../lib/constants.js';
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
        choices: Object.entries(PROVIDERS).map(([key, provider]) => ({
          name: provider.displayName,
          value: key
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
        type: 'list',
        name: 'model',
        message: 'Select the model:',
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
    // process.chdir(projectDir);

    const provider = PROVIDERS[answers.provider];

    const config = {
      baseUrl: provider.baseUrl,
      apiKey: answers.apiKey || 'sk-dummy-key',
      provider: provider.value,
      model: answers.model,
      root: answers.root
    };

    validateConfig(config);
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
