import { Command, program } from 'commander';
import readline from 'readline';
import chalk from 'chalk';
import { Task } from '../lib/task.js';
import { CliRenderer } from '../lib/renderers/cli.js';
import { Logger } from '../lib/logger.js';
import { loadConfig } from '../lib/config/load.js';
import { TaskExecutor } from '../lib/TaskExecutor.js';
import { infoCommand } from './info.js';
import fs from 'fs';
import { CommandOptions } from '../lib/CommandOptions.js';
import { gatherContextInfo, resolveContent } from '../lib/utils.js';
import { createBasicTools } from '../lib/tools/basicTools.js';

export async function chatCommand(options = new CommandOptions()) {
  const logger = new Logger({ verbose: options.verbose });
  let rl;

  const config = await loadConfig(options)

  logger.debug(`Using provider: ${config.provider}`);
  logger.debug(`Using model: ${config.model}`);

  const state = {
    config,
    options,
    /** @type {Array<{ role: string, content: string }>} */
    history: [],
    files: [],
    model: ''
  }

  const { root } = config;
  if (root) {
    fs.mkdirSync(root, { recursive: true });
    process.chdir(root);
  }
  logger.info(`Project root: ${process.cwd()}`);

  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const renderer = new CliRenderer({
    raw: options.raw,
    showStats: options.stats
  });

  logger.info('Starting chat mode (type "exit" to quit, "$info" for config)');

  const chatProgram = new Command();
  chatProgram.exitOverride();

  chatProgram
    .command('exit')
    .description('Exit the chat')
    .action(() => {
      rl.close();
    });

  chatProgram
    .command('info')
    .alias('i')
    .description('Show config info')
    .action(async () => {
      await infoCommand();
    });

  chatProgram
    .command('state')
    .alias('s')
    .description('Show internal state')
    .action(async () => {
      console.log(state)
    });

  chatProgram
    .command('history')
    .description('Show chat history')
    .action((options, command) => {
      if (!state.history?.length) {
        console.log('No chat history')
        return
      }
      state.history.forEach((entry, i) => {
        console.log(`\n[${i + 1}] User: ${entry.prompt}`)
        console.log(`    Assistant: ${entry.response.substring(0, 100)}...`)
      })
    })

  async function handleCommand(input) {
    try {
      await chatProgram.parseAsync(input.split(' '), { from: 'user' })
      return true
    } catch (err) {
      console.error(`Error: ${err.message}`)
      return false
    }
  }

  async function handlePrompt(input = "") {
    state.history.push({ role: 'user', content: input })

    logger.prompt(input);
    process.stdout.write(chalk.blue('Response: '));

    // Get context info first for stats
    const contextInfo = await gatherContextInfo(config.include);

    const context = await resolveContent(contextInfo);
    const tools = createBasicTools({ output: '.' });
    const task = new Task({ prompt: input, context, tools });

    renderer.attach(task.toolProcessor);
    const executor = new TaskExecutor(options);
    const resp = await executor.execute(task);

    state.history.push({ role: 'assistent', content: resp })

    renderer.cleanup();
    process.stdout.write('\n\n');
  }

  const askQuestion = () => {
    rl.question('> ', async (input = "") => {
      const trimmedInput = input.trim()

      if (trimmedInput.startsWith('$')) {
        await handleCommand(trimmedInput.substring(1))
        askQuestion()
        return
      }

      try {
        await handlePrompt(input);
      } catch (error) {
        logger.error(`Error: ${error.message}`);
      }
      askQuestion();
    });
  };

  askQuestion();
}
