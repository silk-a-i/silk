import { executeMessages } from './llm.js';
import { Logger } from './logger.js';

export class TaskExecutor {
  constructor(options = {}) {
    this.logger = new Logger(options);
  }

  async execute(task, options = {}) {
    if (!options) throw new Error('Config required');

    const messages = [
      { role: 'system', content: task.fullSystem },
      { role: 'user', content: task.render() }
    ];

    this.logger.messages(messages);
    return executeMessages(messages, chunk => task.toolProcessor.process(chunk), options);
  }
}
