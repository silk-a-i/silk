import { Command } from 'commander'
import { input } from '@inquirer/prompts'
import { Task } from '../task.js'
import { CliRenderer } from '../renderers/cli.js'
import { Logger, UI } from '../logger.js'
import { loadConfig } from '../config/load.js'
import { CommandOptions } from '../CommandOptions.js'
import { resolveContent } from '../fs.js'
import { createBasicTools } from '../tools/basicTools.js'
import { execute, streamHandler } from '../llm.js'
import { Config } from '../config/Config.js'
import { getContext } from '../getContext.js'
import { postActions } from '../silk.js'
import { setupCommands } from './commands.js'
import ora from 'ora'
import { limit } from '../renderers/utils.js'

const GET_STARTED = `Starting chat mode (type "exit" to quit, "/help" for available commands)`

export class Chat {
  options = {}
  state = {
    config: new Config(),
    options: {},
    /** @type {Array<{ role: string, content: string }>} */
    history: [],
    files: [],
    mood: '',
    model: '',
  }

  constructor(options = new CommandOptions()) {
    this.options = options
    this.logger = new Logger({
      verbose: options.verbose,
      ...options.logger
    })
    this.ui = new Logger()
    this.renderer = new CliRenderer({
      raw: options.raw,
      stats: options.stats
    })
    this.chatProgram = new Command()
    this.chatProgram.exitOverride()
  }

  async init() {
    const { state } = this
    state.config = await loadConfig(this.options)
    const { config } = this.state

    // Set tools
    config.tools = state.config.tools.length
      ? state.config.tools
      : [
        ...createBasicTools({
          output: state.config.output
        }),
        ...state.config.additionalTools
      ]

    this.logger.debug(`Using provider: ${config.provider}`)
    this.logger.debug(`Using model: ${config.model}`)
    this.logger.info(`Project root: ${config.absoluteRoot}`)

    UI.info(GET_STARTED)
    UI.info('Using tools:', config.tools.map(e => e.name).join(', '))
    UI.info('Using context:', config.contextMode)

    this.setupCommands()
    this.askQuestion()
  }

  setupCommands() {
    setupCommands(this)
  }

  async handleCommand(input) {
    try {
      // also handle commands like `/tone "very happy"`
      const argv = input.match(/(?:[^\s"]+|"[^"]*")+/g).map(arg => arg.replace(/^"|"$/g, ''))
      await this.chatProgram.parseAsync(argv, { from: 'user' })
      return true
    } catch (err) {
      console.error(`Error: ${err.message}`)
      return false
    }
  }

  /**
   * @deprecation migrate to 'run'
   **/
  async handlePrompt(prompt = '') {
    const { state, renderer } = this

    this.logger.prompt(prompt)

    const spinner = ora({
      text: 'scoping...',
      color: 'yellow'
    }).start()

    const files = await getContext(state.config)
    const context = await resolveContent(files)

    const c = limit(files.map(e=>e.file), 5)
    spinner.succeed(`Used context [${c}]`)

    const task = new Task({ prompt, context, tools: state.config.tools })
    const system = `${state.mood}${task.fullSystem}`
    renderer.attach(task.toolProcessor)
    renderer.reset()

    const messages = [
      { role: 'system', content: system },
      ...state.history,
      { role: 'user', content: task.render() }
    ]
    UI.info('message size:', JSON.stringify(messages).length)

    const { stream } = await execute(messages, state.config)
    const content = await streamHandler(stream, chunk => {
      task.toolProcessor.process(chunk)
    })

    renderer.cleanup()
    process.stdout.write('\n')

    return { content, currentTask: task }
  }

  // @todo migrate `handlePrompt` to this
  // but without taking a new input but just runs on the current history
  async run() {

  }

  async askQuestion() {
    try {
      const answer = await input(
        {
          message: `>>> `
        }
      )

      if (!answer) {
        console.log('Please enter a message or a command')
        this.askQuestion()
        return
      }
      this.handleQuestion(answer)
    } catch (error) {
      if (error.name === 'ExitPromptError') {
        return
      }
      console.error(`Error: ${error.message}`)
      this.askQuestion()
    }
  }

  async handleQuestion(input = '') {
    const trimmedInput = input.trim()

    const isCommand = trimmedInput.startsWith('/')
    const isExit = trimmedInput === 'exit'

    this.trimmedInput = trimmedInput
    // handle exit
    if (isExit) {
      process.exit(0)
    }

    if (isCommand) {
      await this.handleCommand(trimmedInput.substring(1))
      this.askQuestion()
      return
    }

    // Else use LLM
    try {
      this.state.history.push({ role: 'user', content: input })
      const { content, currentTask } = await this.handlePrompt(input)
      this.state.history.push({ role: 'assistant', content })

      await postActions(currentTask, this)
    } catch (error) {
      this.ui.error(`Error: ${error.message}`)
    }

    this.askQuestion()
  }
}
