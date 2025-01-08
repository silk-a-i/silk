import { Command, program } from 'commander'
import inquirer from 'inquirer'
import { Task } from '../lib/task.js'
import { CliRenderer } from '../lib/renderers/cli.js'
import { Logger } from '../lib/logger.js'
import { loadConfig } from '../lib/config/load.js'
import { infoCommand } from './info.js'
import fs from 'fs'
import { CommandOptions } from '../lib/CommandOptions.js'
import { gatherContextInfo, resolveContent } from '../lib/fs.js'
import { createBasicTools } from '../lib/tools/basicTools.js'
import { execute, streamHandler } from '../lib/llm.js'
import { FileStats } from '../lib/stats.js'
import { Config } from '../lib/config/Config.js'
import { getContext } from '../lib/getContext.js'
import { postActions } from '../lib/silk.js'

export class Chat {
  options = {}
  state = {
    config: new Config(),
    options: {},
    /** @type {Array<{ role: string, content: string }>} */
    history: [],
    files: [],
    system: '',
    model: ''
  }

  constructor (options = new CommandOptions()) {
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

  async init () {
    this.state.config = await loadConfig(this.options)
    const { config } = this.state

    this.logger.debug(`Using provider: ${config.provider}`)
    this.logger.debug(`Using model: ${config.model}`)

    const { root } = config
    if (root) {
      fs.mkdirSync(root, { recursive: true })
      process.chdir(root)
    }
    this.logger.info(`Project root: ${process.cwd()}`)

    this.ui.info('Starting chat mode (type "exit" to quit, "/help" for available commands)')

    this.setupCommands()
    this.askQuestion()
  }

  setupCommands () {
    this.chatProgram
      .command('exit')
      .description('Exit the chat')
      .action(() => {
        process.exit(0)
      })

    this.chatProgram
      .command('info')
      .alias('i')
      .description('Show config info')
      .action(async () => {
        await infoCommand()
      })

    this.chatProgram
      .command('model')
      .alias('m')
      .description('Select model')
      .action(async () => {
        const { model } = await inquirer.prompt([{
          type: 'list',
          name: 'model',
          message: 'Select model:',
          choices: this.state.config.models,
          default: this.state.config.model
        }])
        this.state.config.model = model
      })

    this.chatProgram
      .command('context')
      .alias('c')
      .description('List context')
      .action(async () => {
        const files = await getContext(this.state.config)
        const stats = new FileStats()
        files.forEach(file => stats.addFile(file.path, file))
        stats.getSummary(this.logger, { showLargestFiles: 60 })
      })

    this.chatProgram
      .command('state')
      .alias('s')
      .description('Show internal state')
      .action(async () => {
        console.log(this.state)
      })

    this.chatProgram
      .command('clear')
      .description('Clear history')
      .action(async () => {
        this.state.history = []
      })

    this.chatProgram
      .command('history')
      .alias('h')
      .description('Show chat history')
      .action(() => {
        if (!this.state.history?.length) {
          console.log('No chat history')
          return
        }
        new Logger({ verbose: true }).messages(this.state.history)
      })
  }

  async handleCommand (input) {
    try {
      await this.chatProgram.parseAsync(input.split(' '), { from: 'user' })
      return true
    } catch (err) {
      console.error(`Error: ${err.message}`)
      return false
    }
  }

  /**
   * @deprecation migrate to 'run'
   **/
  async handlePrompt (input = '') {
    const { state }  = this

    this.logger.prompt(input)

    const files = await getContext(state.config)
    const context = await resolveContent(files)

    const tools = state.config.tools.length
      ? state.config.tools
      : [
          ...createBasicTools({
            output: state.config.output
          }),
          ...state.config.additionalTools
        ]
    const task = new Task({ prompt: input, context, tools })

    const system = `${state.system}${task.fullSystem}`

    this.renderer.attach(task.toolProcessor)

    const messages = [
      { role: 'system', content: system },
      ...state.history,
      { role: 'user', content: task.render() }
    ]
    this.logger.info('message size:', JSON.stringify(messages).length)

    const { stream } = await execute(messages, state.config)
    const content = await streamHandler(stream, chunk => {
      task.toolProcessor.process(chunk)
    })

    this.renderer.cleanup()
    process.stdout.write('\n')

    return { content, currentTask: task }
  }

  // @todo migrate to this
  // it should run on the current history
  async run () {

  }

  async askQuestion () {
    try {
      const { input } = await inquirer.prompt([
        {
          type: 'input',
          name: 'input',
          message: '> '
        }
      ])

      this.handleQuestion(input)
    } catch (error) {
      if (error.name === 'ExitPromptError') {
        return
      }
      console.error(`Error: ${error.message}`)
      this.askQuestion()
    }
  }

  async handleQuestion (input = '') {
    const trimmedInput = input.trim()

    const isCommand = trimmedInput.startsWith('/')
    const isExit = trimmedInput === 'exit'

    // handle exit
    if (isExit) {
      process.exit(0)
    }

    if (isCommand) {
      await this.handleCommand(trimmedInput.substring(1))
      this.askQuestion()
      return
    }
    
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

export async function chatCommand (options = new CommandOptions()) {
  const chat = new Chat(options)
  await chat.init()
}
