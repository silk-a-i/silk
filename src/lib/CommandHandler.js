import { Logger, UI } from './logger.js'
import { Task } from './task.js'
import { CliRenderer } from './renderers/cli.js'
import { createBasicTools } from './tools/basicTools.js'
import { getContext } from './getContext.js'
import { resolveContent } from './fs.js'
import { FileStats, LLMStats } from './stats.js'
import { LimitChecker } from './LimitChecker.js'
import ora from 'ora'
import { execute, streamHandler } from './llm.js'
import { postActions } from './silk.js'
import { Config } from './config/Config.js'
import { limit } from './renderers/utils.js'
import { allDone } from './cli.js'

/** @deprecated use executeCommand  */
export class CommandHandler {
  logger = new Logger()
  config = new Config()
  limitChecker = new LimitChecker()

  constructor(config = new Config) {
    this.config = config
    this.logger = new Logger({
      verbose: config.verbose
      // @todo proxy more options
      // ...config.logger
    })
    this.limitChecker = new LimitChecker(config)
  }


  /**
   * Find context from a given prompt
   * @param {*} prompt 
   * @returns 
   */
  async findContext(prompt = "") {
    const { config, logger } = this

    const spinner = ora({
      text: 'scoping...',
      color: 'yellow'
    }).start()
    try {
      /** @todo create a better stats system and make streaming */
      const stats = new LLMStats()
      const files = await getContext(config, {
        prompt,
        on(type, payload) {
          if (type === 'context') {
            spinner.text = `searching within ${payload.length} files...`
          }
          if (type === 'messages') {
            stats.promptBytes = JSON.stringify(payload).length
          }
          if (type === 'text') {
            stats.totalBytes = JSON.stringify(payload).length
          }
        }
      })
      const context = await resolveContent(files)

      const fileList = limit(files.map(e => e.path), 5) || 'none'
      spinner.succeed(`Using ${files.length} file(s). ${fileList}`)

      UI.info(allDone({ stats }))
      return context
    } catch (err) {
      logger.error(err.message)
    }
    spinner.fail('No context found')
    return []
  }

  async execute(prompt = '') {
    const { logger, config } = this
    const { root, dry, stats } = config
    // await this.setupRoot(root)
    // logger.info(`Project root: ${config.absoluteRoot}`)
    // logger.info(`cwd: ${process.cwd()}`)

    logger.prompt(prompt)
    if (!prompt) {
      throw new Error('Prompt is required')
    }

    const files = await this.findContext(prompt)
    if (!files) {
      throw new Error('No context found')
    }


    if (stats) {
      const fileStats = new FileStats()
      files.forEach(file => fileStats.addFile(file.path, file.content))
      fileStats.summary(undefined, { logger })
    }

    const tools = config.tools.length
      ? config.tools
      : [
        ...createBasicTools(config),
        ...config.additionalTools
      ]
    UI.info(`Using tools: ${tools.map(t => t.name).join(', ')}`)
    logger.json({ tools, config })

    if (dry) {
      UI.info('Dry run, execution skipped.')
      return
    }

    const context = await resolveContent(files, process.cwd())
    // const context = await resolveContent(files, config.absoluteRoot)
    const task = new Task({ prompt, context, tools })
    const renderer = new CliRenderer(config).attach(task.toolProcessor)

    try {
      const spinner = ora({
        text: 'thinking...',
        color: 'yellow'
      }).start()

      const messages = [
        { role: 'system', content: task.fullSystem },
        { role: 'user', content: task.render() }
      ]
      const { stream } = await execute(messages, config)

      spinner.stop()

      const content = await streamHandler(stream, chunk => {
        task.toolProcessor.process(chunk)
      })
      task.toolProcessor.cleanup()

      await postActions(task)

      UI.info(allDone({ stats: renderer.stats, messages }))
    } catch (error) {
      logger.error(`Error: ${error.message}`)
    }

    renderer.cleanup()

  }

  // async setupRoot(root) {
  //   if (root) {
  //     fs.mkdirSync(root, { recursive: true })
  //     process.chdir(root)
  //   }
  // }
}
