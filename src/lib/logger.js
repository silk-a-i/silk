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
      console.log(); // Empty line between messages
    });
  }
}
