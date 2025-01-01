import { Command, program } from 'commander';
import inquirer from 'inquirer';
import { Task } from '../lib/task.js';
import { CliRenderer } from '../lib/renderers/cli.js';
import { Logger } from '../lib/logger.js';
import { loadConfig } from '../lib/config/load.js';
import { infoCommand } from './info.js';
import fs from 'fs';
import { CommandOptions } from '../lib/CommandOptions.js';
import { gatherContextInfo, resolveContent } from '../lib/fs.js';
import { createBasicTools } from '../lib/tools/basicTools.js';
import { executeMessages } from '../lib/llm.js';
import { FileStats } from '../lib/stats.js';

export async function chatCommand(options = new CommandOptions()) {
  const logger = new Logger({
    verbose: options.verbose,
    ...options.logger
  });

  const config = await loadConfig(options)

  logger.debug(`Using provider: ${config.provider}`);
  logger.debug(`Using model: ${config.model}`);
  // logger.debug(config);

  const state = {
    config,
    options,
    /** @type {Array<{ role: string, content: string }>} */
    history: [],
    files: [],
    system: '',
    model: ''
  }

  const { root } = config;
  if (root) {
    fs.mkdirSync(root, { recursive: true });
    process.chdir(root);
  }
  logger.info(`Project root: ${process.cwd()}`);

  const renderer = new CliRenderer({
    raw: options.raw,
    showStats: options.stats
  });

  logger.info('Starting chat mode (type "exit" to quit, "/info" for config)');

  const chatProgram = new Command();
  chatProgram.exitOverride();

  chatProgram
    .command('exit')
    .description('Exit the chat')
    .action(() => {
      process.exit(0);
    });

  chatProgram
    .command('info')
    .alias('i')
    .description('Show config info')
    .action(async () => {
      await infoCommand();
    });

  chatProgram
    .command('model')
    .description('Select model')
    .action(async () => {
      // Add model selection
      const { model } = await inquirer.prompt([{
        type: 'list',
        name: 'model',
        message: 'Select model:',
        choices: config.models,
        default: config.model
      }]);
      config.model = model;
    });

  chatProgram
    .command('context')
    .alias('c')
    .description('List context')
    .action(async () => {
      const files = await gatherContextInfo(config.include, config);
      const stats = new FileStats();
      files.forEach(file => stats.addFile(file.path, null, file)); // Use size directly
      stats.getSummary(logger, { showLargestFiles: 60 });
    });

  chatProgram
    .command('state')
    .alias('s')
    .description('Show internal state')
    .action(async () => {
      console.log(state)
    });

  chatProgram
    .command('clear')
    .description('Clear history')
    .action(async () => {
      state.history = []
    });

  chatProgram
    .command('history')
    .alias('h')
    .description('Show chat history')
    .action((options, command) => {
      if (!state.history?.length) {
        console.log('No chat history')
        return
      }
      new Logger({ verbose: true }).messages(state.history)
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

    logger.prompt(input);

    const contextInfo = await gatherContextInfo(config.include);

    const context = await resolveContent(contextInfo);
    const tools = config.tools || [
      ...createBasicTools({
        output: config.output,
      }),
      ...config.additionalTools,
    ]
    const task = new Task({ prompt: input, context, tools });

    state.system = task.fullSystem;

    renderer.attach(task.toolProcessor);

    const messages = [
      { role: 'system', content: task.fullSystem },
      ...state.history,
      { role: 'user', content: task.render() }
    ];
    logger.info('message size:', JSON.stringify(messages).length)

    const content = await executeMessages(messages, chunk => {
      return task.toolProcessor.process(chunk)
    }, config);

    renderer.cleanup();
    process.stdout.write('\n');

    return { content, currentTask: task };
  }

  const askQuestion = async () => {
    try {
      const { input } = await inquirer.prompt([
        {
          type: 'input',
          name: 'input',
          message: '> ',
        },
      ]);

      handleQuestion(input);
    } catch (error) {
      if (error.name === 'ExitPromptError') {
        return
      }
      console.error(`Error: ${error.message}`)
      askQuestion();
    }
  };

  async function handleQuestion(input) {
    const trimmedInput = input.trim();
    if (trimmedInput.startsWith('/')) {
      await handleCommand(trimmedInput.substring(1));
      askQuestion();
      return;
    }

    try {
      state.history.push({ role: 'user', content: input })
      const { content, currentTask } = await handlePrompt(input);
      state.history.push({ role: 'assistent', content })

      // Run any remaining tasks in the queue
      const tasks = currentTask?.toolProcessor.queue;
      const responses = await Promise.all(tasks.map(async task => {
        try {
          return await task(state)
        } catch (error) {
          logger.error(`Error: ${error.message}`);
        }
      }))

      // console.log('Type "exit" to quit, "/info" for config');
    } catch (error) {
      logger.error(`Error: ${error.message}`);
    }
    askQuestion();
  }

  askQuestion();
}
