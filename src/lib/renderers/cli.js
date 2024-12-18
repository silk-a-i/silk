import chalk from 'chalk';
import ora from 'ora';

export class CliRenderer {
  constructor(options = {}) {
    this.raw = options.raw || false;
    this.showStats = options.showStats !== false;
    this.spinners = new Map();
    this.stats = {
      totalBytes: 0,
      textBytes: 0,
      actions: 0,
      startTime: Date.now()
    };
  }

  attach(toolProcessor) {
    if (this.raw) {
      toolProcessor.on('chunk', text => {
        process.stdout.write(text);
        this.stats.textBytes += Buffer.from(text).length;
        this.stats.totalBytes += Buffer.from(text).length;
      });
      
      return this;
    }

    toolProcessor.on('tool:start', ({ tool, path }) => {
      const spinner = ora({
        text: `${tool.name}: ${chalk.cyan(path)}...`,
        color: 'yellow'
      }).start();
      
      this.spinners.set(path, spinner);
      this.stats.actions++;
    });

    toolProcessor.on('tool:progress', (context) => {
      const { tool, args, blockContent } = context;
      const {path} = args
      const spinner = this.spinners.get(path);

      if (spinner && tool) {
        const bytes = Buffer.from(blockContent).length;
        this.stats.totalBytes += bytes;
        spinner.text = `${tool.name}: ${chalk.cyan(path)}... (${this.formatBytes(bytes)})`;
      }
    });

    toolProcessor.on('tool:finish', ({ tool, path }) => {
      const spinner = this.spinners.get(path);
      if (spinner) {
        spinner.succeed(chalk.green(`${tool.name}: ${path} completed`));
        this.spinners.delete(path);
      }
    });

    toolProcessor.on('text', text => {
      process.stdout.write(text);
      this.stats.textBytes += Buffer.from(text).length;
      this.stats.totalBytes += Buffer.from(text).length;
    });

    return this;
  }

  cleanup() {
    if (this.raw) {
      return;
    }

    for (const spinner of this.spinners.values()) {
      spinner.stop();
    }
    this.spinners.clear();

    if (this.showStats) {
      this.displayStats();
    }
  }

  displayStats() {
    const elapsedTime = ((Date.now() - this.stats.startTime) / 1000).toFixed(1);
    console.log(chalk.cyan('\nStats:'));
    console.log(chalk.gray('├─') + ` Time: ${elapsedTime}s`);
    console.log(chalk.gray('├─') + ` Text: ${this.formatBytes(this.stats.textBytes)}`);
    console.log(chalk.gray('├─') + ` Total: ${this.formatBytes(this.stats.totalBytes)}`);
    console.log(chalk.gray('└─') + ` Actions: ${this.stats.actions}`);
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  }
}
