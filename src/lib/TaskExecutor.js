import { executeMessages } from './llm.js';
import { Logger } from './logger.js';

export class TaskExecutor {
  constructor(options = {}) {
    this.logger = new Logger({ verbose: options.verbose });
  }

  async execute(task, options = {}) {
    if (!options.config) {
      throw new Error('Config is required for task execution');
    }

    const messages = [
      {
        role: 'system',
        content: task.fullSystem
      },
      {
        role: 'user',
        content: task.render()
      }
    ];

    this.logger.messages(messages);

    return executeMessages(
      messages,
      (chunk) => task.toolProcessor.process(chunk),
      options
    );
  }
}
