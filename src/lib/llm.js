import { AIClient } from './ai/client.js'
import { Logger } from './logger.js'

/**
 *
 * @param {*} messages
 * @param {*} options
 * @returns
 * @example
 * ```js
 * const stream = await execute(messages, config);
    const content = await streamHandler(stream, chunk => {

    })
      ```
 */
export async function execute (messages = [], options = {}) {
  if (!messages.length) {
    throw new Error('No messages provided')
  }

  const client = new AIClient(options)

  // @todo proxy more options
  // const logger = new Logger(options.logger);
  const logger = new Logger({
    verbose: options.verbose
  })
  logger.info(`Using model: ${client.config.model}`)
  logger.messages(messages)

  const stream = await client.createCompletion({ messages })
  return { stream, client }
}

export async function streamHandler (stream, cb = (c) => {}) {
  let fullContent = ''
  for await (const chunk of stream) {
    if (chunk) {
      fullContent += chunk
      cb(chunk)
    }
  }
  return fullContent
}
