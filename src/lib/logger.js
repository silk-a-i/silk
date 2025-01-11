import chalk from 'chalk'

export class Logger {
  maxMessageLength = 0
  verbose = true

  constructor (options = {}) {
    Object.assign(this, options)
  }

  info (...args) {
    if (!this.verbose) return
    console.log(chalk.blue(...args))
  }

  success (...args) {
    console.log(chalk.green(...args))
  }

  hint (...args) {
    console.log(chalk.blue(...args))
  }

  error (...args) {
    console.error(chalk.red(...args))
  }

  debug (...args) {
    if (!this.verbose) return
    console.log(chalk.gray('Debug:'), ...args)
  }

  prompt (prompt) {
    if (!this.verbose) return
    console.log(chalk.yellow('\nPrompt used:'))
    console.log(chalk.gray(prompt))
    console.log()
  }

  json (prompt) {
    if (!this.verbose) return
    console.log(chalk.gray(JSON.stringify(prompt, null, 2)))
    console.log()
  }

  stats (title, items) {
    if (!this.verbose) return

    console.log(chalk.cyan(`\n${title}:`))
    items.forEach(({ label, value }, i, arr) => {
      const prefix = i === arr.length - 1 ? '└─' : '├─'
      console.log(chalk.gray(prefix) + ` ${label}${value !== '' ? ': ' + value : ''}`)
    })
  }

  messages (messages = []) {
    if (!this.verbose) return

    console.log(chalk.yellow('\nMessages:'))
    messages.forEach(message => {
      this.message(message)
    })
  }

  message (message = {}, options = {}) {
    if (!this.verbose) return

    const _maxLength = options.maxLength || this.maxMessageLength

    const roleColor = {
      system: chalk.magenta,
      user: chalk.cyan,
      assistant: chalk.green
    }[message.role] || chalk.white

    console.log(roleColor(`[${message.role}]`))
    if (_maxLength && message.content.length > _maxLength) {
      const truncatedContent = message.content.slice(0, _maxLength)
      const remainingBytes = Buffer.byteLength(message.content) - Buffer.byteLength(truncatedContent)
      console.log(chalk.gray(truncatedContent + `... (${remainingBytes} more bytes)`))
    } else {
      console.log(chalk.gray(message.content))
    }
    console.log()
  }
}
