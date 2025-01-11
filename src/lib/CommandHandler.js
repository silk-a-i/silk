import { Logger } from './logger.js'
import { TaskExecutor } from './TaskExecutor.js'
import { Task } from './task.js'
import { CliRenderer } from './renderers/cli.js'
import { createBasicTools } from './tools/basicTools.js'
import { getContext } from './getContext.js'
import { gatherContextInfo, resolveContent } from './fs.js'
import { FileStats } from './stats.js'
import { CommandOptions } from './CommandOptions.js'
import { LimitChecker } from './LimitChecker.js'
import fs from 'fs'
import ora from 'ora'
import { streamHandler } from './llm.js'
import { postActions } from './silk.js'

export class CommandHandler {
  logger = new Logger()
  options = new CommandOptions()
  executor = new TaskExecutor()
  limitChecker = new LimitChecker()

  constructor(options = {}) {
    this.options = new CommandOptions(options)
    this.logger = new Logger({
      verbose: options.verbose
      // @todo proxy more options
      // ...options.logger
    })
    this.executor = new TaskExecutor(this.options)
    this.limitChecker = new LimitChecker(options)
  }

  async execute(prompt = '') {
    const { logger, options } = this
    const { root, include, dry, stats } = this.options
    await this.setupRoot(root)
    logger.info(`Project root: ${process.cwd()}`)

    logger.prompt(prompt)

    const validFiles = await getContext(options)

    if (stats) {
      const fileStats = new FileStats()
      validFiles.forEach(file => fileStats.addFile(file.path, file.content))
      fileStats.summary(undefined, { logger })
    }

    const tools = options.tools.length
      ? options.tools
      : [
        ...createBasicTools(options),
        ...options.additionalTools
      ]
    logger.info(`Using tools: ${tools.map(t => t.name).join(', ')}`)
    logger.json({ tools, options })

    if (dry) {
      logger.info('Dry run, skipping execution')
      return
    }

    const context = await resolveContent(validFiles)
    const task = new Task({ prompt, context, tools })
    const renderer = new CliRenderer(options).attach(task.toolProcessor)

    try {
      const spinner = ora({
        text: 'thinking...',
        color: 'yellow'
      }).start()

      const { stream } = await this.executor.createStream(task)

      spinner.stop()

      const content = await streamHandler(stream, chunk => {
        task.toolProcessor.process(chunk)
      })

      postActions(task, { logger: this.logger })
    } catch (error) {
      logger.error(`Error: ${error.message}`)
    }

    renderer.cleanup()
  }

  async setupRoot(root) {
    if (root) {
      fs.mkdirSync(root, { recursive: true })
      process.chdir(root)
    }
  }
}
