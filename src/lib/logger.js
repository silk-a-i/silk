import chalk from 'chalk'

const COLORS = {
  json: chalk.gray,
  info: chalk.blue,
  success: chalk.green,
  hint: chalk.blue,
  error: chalk.red,
  debug: chalk.gray,
  message: chalk.gray
}

export class Logger {
  maxMessageLength = 0
  verbose = true

  constructor(options = {}) {
    Object.assign(this, options)
  }

  info(...args) {
    if (!this.verbose) return
    console.log(COLORS.info(...args))
  }

  success(...args) {
    console.log(COLORS.success(...args))
  }

  hint(...args) {
    console.log(COLORS.hint(...args))
  }

  error(...args) {
    console.error(COLORS.error(...args))
  }

  debug(...args) {
    if (!this.verbose) return
    console.log(COLORS.debug('Debug:'), ...args)
  }

  prompt(prompt) {
    if (!this.verbose) return
    console.log(chalk.yellow('\nPrompt used:'))
    console.log(COLORS.message(prompt))
    console.log()
  }

  json(prompt) {
    if (!this.verbose) return
    console.log(COLORS.json(JSON.stringify(prompt, null, 2)))
    console.log()
  }

  stats(title, items) {
    if (!this.verbose) return

    stats(title, items)
  }

  list(items = []) {
    if (!this.verbose) return

    list(items)
  }

  messages(messages = []) {
    if (!this.verbose) return

    Messages(messages, { maxLength: this.maxMessageLength })
  }

  message(message = {}, options) {
    if (!this.verbose) return

    Message(message, options)
  }
}

export const Log = new Logger({
  verbose: false
})

export const UI = new Logger({
  verbose: true
})

export function heading(title = "") { console.log(chalk.cyan(title)) }

export function stats(title = "", items = []) {
  heading(`\n${title}:`)
  list(items)
}

export function list(items = []) {
  items.forEach(({ label, value, raw }, i, arr) => {
    const prefix = i === arr.length - 1 ? '└─' : '├─'
    const keyValue = raw || `${label}: ${value || 'N/A'}`
    console.log(COLORS.message(prefix) + keyValue)
  })
}

const MESSAGE_OPTIONS = {
  maxLength: 0
}

export function Messages(messages = [], options = MESSAGE_OPTIONS) {
  console.log(chalk.yellow('\nMessages:'))
  messages.forEach(message => {
    Message(message, options)
  })
}

export function Message(message = {}, options = MESSAGE_OPTIONS) {
  const _maxLength = options.maxLength

  const roleColor = {
    system: chalk.magenta,
    user: chalk.cyan,
    assistant: chalk.green
  }[message.role] || chalk.white

  console.log(roleColor(`[${message.role}]`))
  if (_maxLength && message.content.length > _maxLength) {
    const truncatedContent = message.content.slice(0, _maxLength)
    const remainingBytes = Buffer.byteLength(message.content) - Buffer.byteLength(truncatedContent)
    console.log(COLORS.message(truncatedContent + `... (${remainingBytes} more bytes)`))
  } else {
    console.log(COLORS.message(message.content))
  }
  console.log()
}