import chalk from 'chalk'

export const COLORS = {
  default: chalk.white,
  note: chalk.gray.italic,
  json: chalk.gray,
  info: chalk.yellow,
  success: chalk.green,
  hint: chalk.blue,
  error: chalk.red,
  debug: chalk.gray,
  message: chalk.gray,
  messages: {
    question: chalk.green,
    answer: chalk.blueBright,
  }
}
