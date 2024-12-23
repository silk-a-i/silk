import { executeMessages } from './llm.js';
import { Task } from './task.js';

export class TaskExecutor {
  content = ""
  constructor(options = {}) {
    this.options = options;
  }

  async execute(task = new Task) {
    this.currentTask = task;
    const {options} = this
    if (!options) throw new Error('Config required');

    const messages = [
      { role: 'system', content: task.fullSystem },
      { role: 'user', content: task.render() }
    ];

    const resp = await executeMessages(messages, chunk => {
      return task.toolProcessor.process(chunk)
    }, options);
    this.content = resp;
    return this;
  }
}
