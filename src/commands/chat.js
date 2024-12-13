import { program } from 'commander';
import readline from 'readline';
import chalk from 'chalk';
import { Task } from '../lib/task.js';
import { CliRenderer } from '../lib/renderers/cli.js';
import { Logger } from '../lib/logger.js';
import { loadConfig } from '../lib/config/load.js';
import { TaskExecutor } from '../lib/TaskExecutor.js';
import { infoCommand } from './info.js';
import fs from 'fs';

export async function chatCommand(root, options) {
  const logger = new Logger({ verbose: options.verbose });
  let rl;

  try {
    const config = await loadConfig();
    logger.debug(`Using provider: ${config.provider}`);
    logger.debug(`Using model: ${config.model}`);

    if (root) {
      fs.mkdirSync(root, { recursive: true });
      process.chdir(root);
    }

    rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const renderer = new CliRenderer({
      raw: options.raw,
      showStats: options.stats
    });
    const executor = new TaskExecutor(options);

    logger.info('Starting interactive chat mode (type "exit" to quit, "info" for config)');

    const askQuestion = () => {
      rl.question('> ', async (input) => {
        if (input.toLowerCase() === 'exit') {
          rl.close();
          return;
        }

        if (input.toLowerCase() === 'info') {
          await infoCommand();
          askQuestion();
          return;
        }

        try {
          logger.prompt(input);
          process.stdout.write(chalk.blue('Response: '));

          const task = new Task({
            prompt: input,
            context: []
          });

          renderer.attach(task.toolProcessor);
          await executor.execute(task, { ...options, config });

          // renderer.cleanup();
          // process.stdout.write('\n\n');
        } catch (error) {
          logger.error(`Error: ${error.message}`);
        }

        askQuestion();
      });
    };

    askQuestion();

  } catch (error) {
    logger.error(`Failed to start chat: ${error.message}`);
    if (rl) rl.close();
    process.exit(1);
  }
}
