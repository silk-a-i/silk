import { execute, streamHandler } from './llm.js'
import { Task } from './task.js'

export class TaskExecutor {
  content = ''
  constructor (options = {}) {
    this.options = options
  }

  async createStream (task = new Task()) {
    this.currentTask = task
    const { options } = this
    if (!options) throw new Error('Config required')

    const messages = [
      { role: 'system', content: task.fullSystem },
      { role: 'user', content: task.render() }
    ]

    return await execute(messages, options)
  }

  async execute (task = new Task()) {
    const stream = await this.createStream(task)
    const content = await streamHandler(stream, chunk => {
      task.toolProcessor.process(chunk)
    })

    this.content = content
    return this
  }
}
