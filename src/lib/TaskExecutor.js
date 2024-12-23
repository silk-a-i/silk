import { executeMessages } from './llm.js';
import { Logger } from './logger.js';
import { Task } from './task.js';

export class TaskExecutor {
  constructor(options = {}) {
    this.options = options;
    this.logger = new Logger(options);
  }

  async execute(task = new Task) {
    const {options} = this
    if (!options) throw new Error('Config required');

    const messages = [
      { role: 'system', content: task.fullSystem },
      { role: 'user', content: task.render() }
    ];

    try {
      const resp = await executeMessages(messages, chunk => task.toolProcessor.process(chunk), options);
      return resp;
    } catch (error) {
      this.logger.error('Error executing task:', error.message);
    }
  }
}
