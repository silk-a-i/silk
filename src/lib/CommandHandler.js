import { Logger } from './logger.js';
import { TaskExecutor } from './TaskExecutor.js';
import { Task } from './task.js';
import { CliRenderer } from './renderers/cli.js';
import { extractPrompt } from './prompt-extractor.js';
import { createBasicTools } from './tools/basicTools.js';
import { gatherContext, gatherContextInfo, resolveContent } from './utils.js';
import { FileStats } from './stats.js';
import { CommandOptions } from './CommandOptions.js';
import fs from 'fs';

export class CommandHandler {
  constructor(options = {}) {
    this.options = new CommandOptions(options);
    this.logger = new Logger(this.options);
    this.executor = new TaskExecutor(this.options);
  }

  async execute(promptOrFile = "", options = {}) {
    try {
      const {root} = options
      this.logger.info(JSON.stringify({root, promptOrFile, options}, null, 2));

      const prompt = await extractPrompt(promptOrFile);

      await this.setupRoot(root);
      this.logger.info(`Project root: ${process.cwd()}`);
      
      // Display prompt
      this.logger.prompt(prompt);

      // Get context info first for stats
      const contextInfo = await gatherContextInfo(options.context || '**/*');
      // Display stats
      const stats = new FileStats();
      contextInfo.forEach(file => stats.addFile(file.path, null, file));
      stats.getSummary(this.logger);

      // Now resolve full content
      const context = await resolveContent(contextInfo);
      const tools = createBasicTools({ output: this.options.output });

      const task = new Task({ prompt, context, tools });
      const renderer = new CliRenderer(this.options).attach(task.toolProcessor);

      if(!options.dry) {
        await this.executor.execute(task, options);
      }
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
}
