import EventEmitter from 'events';

export class BaseProcessor extends EventEmitter {
  constructor(options = {}) {
    super();
    this.options = options;
  }

  async process(content) {
    throw new Error('Process method must be implemented');
  }

  async cleanup() {
    // Optional cleanup method
  }
}