import chalk from 'chalk';

export class Logger {
  constructor(options = {}) {
    this.verbose = options.verbose || false;
  }

  info(message) {
    console.log(chalk.blue(message));
  }

  success(message) {
    console.log(chalk.green(message));
  }

  error(message) {
    console.error(chalk.red(message));
  }

  debug(message) {
    if (this.verbose) {
      console.log(chalk.gray('Debug:'), message);
    }
  }

  prompt(prompt) {
    if (this.verbose) {
      console.log(chalk.yellow('\nPrompt used:'));
      console.log(chalk.gray(prompt));
      console.log(); // Empty line for better readability
    }
  }
}
