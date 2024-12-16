import { Logger } from './logger.js';
import { TaskExecutor } from './TaskExecutor.js';
import { Task } from './task.js';
import { CliRenderer } from './renderers/cli.js';
import { extractPrompt } from './prompt-extractor.js';
import { createBasicTools } from './tools/basicTools.js';
import { gatherContext } from './utils.js';
import { CommandOptions } from './CommandOptions.js';
import fs from 'fs';

export class CommandHandler {
  constructor(options = {}) {
    this.options = new CommandOptions(options);
    this.logger = new Logger(this.options);
    this.executor = new TaskExecutor(this.options);
  }

  async execute(root, promptOrFile, options = {}) {
    try {
      await this.setupRoot(root);
      const prompt = await extractPrompt(promptOrFile);
      const context = await this.getContext(options);
      const tools = createBasicTools({ output: this.options.output });
      
      const task = new Task({ prompt, context, tools });
      const renderer = new CliRenderer(this.options).attach(task.toolProcessor);
      
      await this.executor.execute(task, options);
      renderer.cleanup();
      
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async setupRoot(root) {
    if (root) {
      fs.mkdirSync(root, { recursive: true });
      process.chdir(root);
    }
  }

  async getContext(options) {
    const pattern = this.options.context || '**/*';
    return gatherContext(pattern, options);
  }
}
