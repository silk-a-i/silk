import { COLORS } from "./colors.js"

export class Debugger {
  maxMessageLength = 0
  messages = []
  bufferSize = 10

  constructor(options = {}) {
    Object.assign(this, options)
  }

  info(...args) {
    if (this.messages.length >= this.bufferSize) {
      this.messages.shift() // Remove the oldest message
    }
    this.messages.push({
      type: 'info',
      content: args,
      timestamp: Date.now()
    })
  }

  render() {
    return this.messages.map(({ type, content, timestamp }) => {
      const date = new Date(timestamp).toLocaleString()
      const color = COLORS[type] || COLORS.default
      return `[${date}] [${color(type.toUpperCase())}]: ${content.join(' ')}`
    }).join('\n')
  }
}
