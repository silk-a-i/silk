import chalk from 'chalk';
import ora from 'ora';

export class CliRenderer {
  constructor(options = {}) {
    this.raw = options.raw || false;
    this.showStats = options.showStats !== false;
    this.buffer = '';
    this.lineBuffer = '';
    this.inAction = false;
    this.currentAction = null;
    this.spinner = null;
    this.stats = {
      totalBytes: 0,
      textBytes: 0,
      actions: 0,
      startTime: Date.now()
    };
  }

  processLine(line) {
    if (this.raw) {
      process.stdout.write(line + '\n');
      this.stats.totalBytes += Buffer.from(line + '\n').length;
      return;
    }

    // Check for action tags
    const createMatch = line.match(/<action do="create" file="([^"]+)">/);
    const modifyMatch = line.match(/<action do="modify" file="([^"]+)">/);
    const deleteMatch = line.match(/<action do="delete" file="([^"]+)">/);

    if (createMatch || modifyMatch || deleteMatch) {
      this.inAction = true;
      this.stats.actions++;
      const [, filename] = createMatch || modifyMatch || deleteMatch;
      const action = createMatch ? 'Creating' : modifyMatch ? 'Modifying' : 'Deleting';
      this.currentAction = { type: action.toLowerCase(), file: filename };
      this.spinner = ora({
        text: `${action} ${chalk.cyan(filename)}...`,
        color: 'yellow'
      }).start();
      return;
    }

    if (line.includes('</action>') && this.inAction) {
      this.inAction = false;
      if (this.currentAction) {
        const { type, file } = this.currentAction;
        const actionColor = type === 'creating' ? 'green' : type === 'modifying' ? 'blue' : 'red';
        const actionText = type === 'creating' ? 'Created' : type === 'modifying' ? 'Modified' : 'Deleted';
        this.spinner?.succeed(chalk[actionColor](`${actionText} ${file}`));
      }
      this.spinner = null;
      this.currentAction = null;
      return;
    }

    const lineBytes = Buffer.from(line + '\n').length;
    this.stats.totalBytes += lineBytes;

    if (!this.inAction) {
      this.stats.textBytes += lineBytes;
      process.stdout.write(line + '\n');
    }
  }

  render(chunk) {
    this.buffer += chunk;
    this.lineBuffer += chunk;

    const lines = this.lineBuffer.split('\n');
    this.lineBuffer = lines.pop() || '';

    for (const line of lines) {
      this.processLine(line);
    }
  }

  cleanup() {
    if (this.lineBuffer) {
      this.processLine(this.lineBuffer);
      this.lineBuffer = '';
    }

    if (this.spinner) {
      this.spinner.stop();
      this.spinner = null;
    }

    if (this.showStats && !this.raw) {
      const elapsedTime = ((Date.now() - this.stats.startTime) / 1000).toFixed(1);
      console.log(chalk.cyan('\nStats:'));
      console.log(chalk.gray('├─') + ` Time: ${elapsedTime}s`);
      console.log(chalk.gray('├─') + ` Total: ${this.formatBytes(this.stats.totalBytes)}`);
      console.log(chalk.gray('├─') + ` Text: ${this.formatBytes(this.stats.textBytes)}`);
      console.log(chalk.gray('└─') + ` Actions: ${this.stats.actions}`);
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  }

  getStats() {
    return {
      ...this.stats,
      elapsedTime: (Date.now() - this.stats.startTime) / 1000
    };
  }
}