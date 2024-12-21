import chalk from 'chalk';

export class Logger {
  constructor(options = {}) {
    this.verbose = options.verbose || false;
  }

  info(message) {
    if (!this.verbose) return;
    console.log(chalk.blue(message));
  }

  success(message) {
    console.log(chalk.green(message));
  }

  hint(message) {
    console.log(chalk.blue(message));
  }

  error(message) {
    console.error(chalk.red(message));
  }

  debug(message) {
    if (!this.verbose) return;
    console.log(chalk.gray('Debug:'), message);
  }

  prompt(prompt) {
    if (!this.verbose) return;
    console.log(chalk.yellow('\nPrompt used:'));
    console.log(chalk.gray(prompt));
    console.log();
  }

  stats(title, items) {
    console.log(chalk.cyan(`\n${title}:`));
    items.forEach(({ label, value }, i, arr) => {
      const prefix = i === arr.length - 1 ? '└─' : '├─';
      console.log(chalk.gray(prefix) + ` ${label}: ${value}`);
    });
  }

  messages(messages) {
    if (!this.verbose) return;
    
    console.log(chalk.yellow('\nMessages:'));
    messages.forEach(message => {
      const roleColor = {
        system: chalk.magenta,
        user: chalk.cyan,
        assistant: chalk.green
      }[message.role] || chalk.white;

      console.log(roleColor(`[${message.role}]`));
      console.log(chalk.gray(message.content));
      console.log();
    });
  }
}
