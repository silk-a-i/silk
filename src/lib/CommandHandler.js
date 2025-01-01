import { Logger } from './logger.js';
import { TaskExecutor } from './TaskExecutor.js';
import { Task } from './task.js';
import { CliRenderer } from './renderers/cli.js';
import { createBasicTools } from './tools/basicTools.js';
import { gatherContextInfo, resolveContent } from './fs.js';
import { FileStats } from './stats.js';
import { CommandOptions } from './CommandOptions.js';
import { LimitChecker } from './LimitChecker.js';
import fs from 'fs';

export class CommandHandler {
  logger = new Logger();
  options = new CommandOptions();
  executor = new TaskExecutor();
  limitChecker = new LimitChecker();

  constructor(options = {}) {
    this.options = new CommandOptions(options);
    this.logger = new Logger({
      verbose: options.verbose,
      ...options.logger
    });
    this.executor = new TaskExecutor(this.options);
    this.limitChecker = new LimitChecker(options);
  }

  async execute(prompt = "") {
    const { logger, options } = this;
    const { root, include, dry, stats } = this.options;

    await this.setupRoot(root);
    logger.info(`Project root: ${process.cwd()}`);

    // Display prompt
    logger.prompt(prompt);

    // Get context info first for stats
    const contextInfo = await gatherContextInfo(include, options);

    // Display stats
    if(stats) {
      const fileStats = new FileStats();
      contextInfo.forEach(file => fileStats.addFile(file.path, null, file));
      fileStats.getSummary(logger);
    }
    
    // Check limits
    try {
      contextInfo.forEach(file => this.limitChecker.checkFile(file.path, file.size));
    } catch (e) {
      console.log()
      logger.error(e.message);
      logger.hint(`Reduce the context or increase the limits in the config file. ${options.configPath}`);
      console.log()
      return;
    }

    // Now resolve full content
    const context = await resolveContent(contextInfo);

    const tools = options.tools || [
      ...createBasicTools({
        output: options.output,
      }),
      ...options.additionalTools,
    ]

    const task = new Task({ prompt, context, tools });
    const renderer = new CliRenderer(options).attach(task.toolProcessor);

    if (!dry) {
      try {
        const resp = await this.executor.execute(task);
  
        const MOCK_STATE = {
          history: [],
        }
        const state = MOCK_STATE
        
        // Any tasks in the queue?
        const tasks = resp.currentTask?.toolProcessor.queue;
        const responses = await Promise.all(tasks.map(async task => {
          try {
            return await task(state)
          } catch (error) {
            logger.error(`Error: ${error.message}`);
          }
        }))
      } catch (error) {
        logger.error(`Error: ${error.message}`);
      }
    }

    renderer.cleanup();
  }

  async setupRoot(root) {
    if (root) {
      fs.mkdirSync(root, { recursive: true });
      process.chdir(root);
    }
  }
}
