import { UI } from './logger.js'
import { Task } from './task.js'
import { CliRenderer } from './renderers/cli.js'
import { execute, streamHandler } from './llm.js'
import { finishToolQueue, postActions } from './silk.js'
import { Config } from './config/Config.js'
import { formatBytes } from './renderers/utils.js'
import { COLORS } from './colors.js'
import { ToolProcessor } from './ToolProcessor.js'
import { allDone } from './cli.js'

export const executeTask = async (task = new Task, config = new Config()) => {
  const { root, dry, tools } = config

  if (dry) {
    UI.info('Dry run, execution skipped.')
    return
  }

  const renderer = new CliRenderer(config).attach(task.toolProcessor)

  const toolProcessor = new ToolProcessor(task.tools)
  try {
    const messages = [
      { role: 'system', content: task.fullSystem },
      { role: 'user', content: task.render() }
    ]
    const { stream } = await execute(messages, config)

    const content = await streamHandler(stream, chunk => {
      toolProcessor.process(chunk)
    })
    toolProcessor.cleanup()

    await postActions(task)

    renderer.stats.promptBytes = JSON.stringify(messages).length
    UI.info(allDone({ stats: renderer.stats }))
  } catch (error) {
    UI.error(`Error: ${error.message}`)
  }

  renderer.cleanup()
}


export async function executeMessages (messages = [], config = new Config()) {
  const toolProcessor = new ToolProcessor(config.tools)
  const renderer = new CliRenderer(config).attach(toolProcessor)
  const { stream } = await execute(messages, config)

  const content = await streamHandler(stream, chunk => {
    toolProcessor.process(chunk)
  })
  toolProcessor.cleanup()

  await finishToolQueue(toolProcessor.queue)

  renderer.stats.promptBytes = JSON.stringify(messages).length
  UI.info(allDone({ stats: renderer.stats }))

  renderer.cleanup()
}