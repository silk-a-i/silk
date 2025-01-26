import { Logger, UI } from './logger.js'
import { Task } from './task.js'
import { CliRenderer } from './renderers/cli.js'
import { createBasicTools } from './tools/basicTools.js'
import { getContext } from './getContext.js'
import { resolveContent } from './fs.js'
import { FileStats } from './stats.js'
import { LimitChecker } from './LimitChecker.js'
import ora from 'ora'
import { execute, streamHandler } from './llm.js'
import { postActions } from './silk.js'
import { Config } from './config/Config.js'
import { formatBytes, limit } from './renderers/utils.js'
import { COLORS } from './colors.js'
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

  async execute(prompt = '') {
    const { logger, config } = this
    const { root, dry, stats } = config
    // await this.setupRoot(root)
    // logger.info(`Project root: ${config.absoluteRoot}`)
    // logger.info(`cwd: ${process.cwd()}`)

    logger.prompt(prompt)

    // Gather context
    const spinner = ora({
      text: 'gathering context...',
      color: 'yellow'
    }).start()
    const files = config.context ? 
      await getContext(config, { prompt }) :
      []

    const c = limit(files.map(e=>e.file), 2)
    spinner.succeed(`using ${files.length} files ${c}`)
    UI.hint(limit(files.map(e=>e.path), 6).join(', '))
    
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

      UI.info(allDone({ renderer, messages }))
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
