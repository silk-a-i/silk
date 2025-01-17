import { Command, program } from 'commander'
import inquirer from 'inquirer'
import { Task } from '../task.js'
import { CliRenderer } from '../renderers/cli.js'
import { Logger } from '../logger.js'
import { loadConfig } from '../config/load.js'
import { info } from '../../commands/info.js'
import fs from 'fs'
import { CommandOptions } from '../CommandOptions.js'
import { gatherContextInfo, resolveContent } from '../fs.js'
import { createBasicTools } from '../tools/basicTools.js'
import { execute, streamHandler } from '../llm.js'
import { FileStats } from '../stats.js'
import { Config } from '../config/Config.js'
import { getContext } from '../getContext.js'
import { postActions } from '../silk.js'
import { cliHook } from './cli-new.js'

const MOODS = ['brief', 'happy', 'sad', 'angry', 'professional', 'neutral', 'other']

export class Chat {
  options = {}
  state = {
    config: new Config(),
    options: {},
    /** @type {Array<{ role: string, content: string }>} */
    history: [],
    files: [],
    mood: '',
    model: ''
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

  setupCommands() {
    const { chatProgram, logger, ui, state } = this

    chatProgram
      .command('exit')
      .description('Exit the chat')
      .action(() => {
        process.exit(0)
      })

    chatProgram
      .command('context')
      .description('Set the context mode')
      .action(() => {
        // @todo
      })

    chatProgram
      .command('save')
      .description('Save the chat state to file')
      .action(() => {
        // @todo
        // const { history, mood } = state
        // fs.writeFileSync('chat.json', JSON.stringify({ history, mood }, null, 2))
        // ui.info('Chat state saved')
      })

      chatProgram
      .command('restore')
      .description('Restore the chat state from file')
      .action(() => {
        // @todo
      })

    chatProgram
      .command('tone')
      .alias('t')
      .argument('[tone]', 'tone')
      .description('Set the mood')
      .action(async (tone = '') => {
        async function askMood() {
          const { toneOfVoice } = await inquirer.prompt([{
            type: 'list',
            name: 'toneOfVoice',
            message: 'Select tone of voice:',
            choices: MOODS
          }])

          if (toneOfVoice === 'other') {
            const { customMood } = await inquirer.prompt([{
              type: 'input',
              name: 'customMood',
              message: 'Enter custom tone of voice:'
            }])
            return customMood
          }
          return toneOfVoice
        }

        const mood = tone || await askMood()
        ui.info(`Tone of voice set to: ${mood}`)
        state.mood = mood
      })

    chatProgram
      .command('info')
      .alias('i')
      .description('Show config info')
      .action(async () => {
        await info()
      })

    chatProgram
      .command('model')
      .alias('m')
      .description('Select model')
      .action(async () => {
        const { model } = await inquirer.prompt([{
          type: 'list',
          name: 'model',
          message: 'Select model:',
          choices: state.config.models,
          default: state.config.model
        }])
        state.config.model = model
      })

    chatProgram
      .command('context')
      .alias('c')
      .description('List context')
      .action(async () => {
        const files = await getContext(state.config)
        const stats = new FileStats()
        files.forEach(file => stats.addFile(file.path, file))
        stats.summary({ showLargestFiles: 20 })
      })

    chatProgram
      .command('state')
      .alias('s')
      .description('Show internal state')
      .action(async () => {
        console.log(state)
      })

    chatProgram
      .command('clear')
      .description('Clear history')
      .action(async () => {
        state.history = []
      })

    chatProgram
      .command('history')
      .alias('h')
      .description('Show chat history')
      .action(() => {
        if (!state.history?.length) {
          console.log('No chat history')
          return
        }
        new Logger({ verbose: true }).messages(state.history)
      })
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
  async handlePrompt(input = '') {
    const { state } = this

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

    const system = `${state.mood}${task.fullSystem}`

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

  // @todo migrate `handlePrompt` to this
  // but without taking a new input but just runs on the current history
  async run() {

  }

  async askQuestion() {
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

    const isCliCommand = trimmedInput.startsWith('$')
    if(isCliCommand) {
      await cliHook(this)
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
