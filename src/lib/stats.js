export class Stats {
  constructor() {
    this.reset();
  }

  reset() {
    this.contextSize = 0;
    this.promptSize = 0;
    this.startTime = Date.now();
  }

  addContext(size) {
    this.contextSize += size;
  }

  addPrompt(size) {
    this.promptSize += size;
  }

  getElapsedTime() {
    return Date.now() - this.startTime;
  }

  getSummary() {
    return {
      contextSize: this.formatBytes(this.contextSize),
      promptSize: this.formatBytes(this.promptSize),
      elapsedTime: `${(this.getElapsedTime() / 1000).toFixed(2)}s`
    };
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  }
}