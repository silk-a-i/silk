import { Chat } from "./chat.js"
import inquirer from 'inquirer'
import { Messages } from '../logger.js'
import { installInfoCommand } from '../../commands/info.js'
import { FileStats } from '../stats.js'
import { CONTEXT_MODES } from '../config/Config.js'
import { install as scopePlugin } from "./tools/scope.js"
import { installShellCommand } from "./commands/shell.js"
import { installConfigCommand } from "../../commands/config.js"
import { installRun } from "../../commands/run.js"
import { gatherContextInfo } from "../fs.js"
import { renderFileStructure } from "../renderers/renderFileStructure.js"

const MOODS = ['brief', 'happy', 'sad', 'angry', 'professional', 'neutral', 'other']

export function setupCommands(ctx = new Chat) {
    const { chatProgram, logger, ui, state } = ctx

    chatProgram
        .command('exit')
        .description('Exit the chat')
        .action(() => {
            process.exit(0)
        })

    // Add the global commands
    installConfigCommand(chatProgram)
    
    scopePlugin(chatProgram, ctx)

    installShellCommand(chatProgram)

    installRun(chatProgram)

    // Chat specific commands
    chatProgram
        .command('mode')
        .alias('m')
        .argument('[mode]', 'mode')
        .description('Set the context mode')
        .action(async (mode = '') => {
            async function ask() {
                const { contextMode } = await inquirer.prompt([{
                    type: 'list',
                    name: 'contextMode',
                    message: 'Select context mode:',
                    choices: Object.values(CONTEXT_MODES)
                }])
                return contextMode
            }

            const contextMode = mode || await ask()

            state.config.contextMode = contextMode
            ui.info(`Context mode set to: ${contextMode}`)
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

        // chatProgram
        // .command('dump')
        // .description('Dump current chat history to a markdown file')
        // .action(() => {
        //     // function toMarkdown(history = []) {
        //     //     return history.map(({ role, content }) => {
        //     //         return `${role === 'user' ? 'You' : 'Bot'}: ${content}`
        //     //     }).join('\n')
        //     // }

        //     const { history } = state
        //     const markdown = toMarkdown(history)
        //     fs.writeFileSync('chat.md', markdown)
        //     ui.info('Chat state saved')
        // })

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

    installInfoCommand(chatProgram)

    chatProgram
        .command('model')
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
        .option('-v, --verbose', 'Show full context', false)
        .description('List context')
        .action(async (options = {}) => {
            // const files = await getContext(state.config)
            const files = await gatherContextInfo(state.config.include, state.config)
            const stats = new FileStats()
            files.forEach(file => stats.addFile(file.path, file))
            stats.summary({ showLargestFiles: options.verbose ? -1 : 10 })
        })

    chatProgram
        .command('files')
        .alias('f')
        .description('List files')
        .action(async (options = {}) => {
            const files = await gatherContextInfo(state.config.include, state.config)
            const s = renderFileStructure(files.map(f => f.path))
            console.log(s)
        })

    chatProgram
        .command('state')
        .alias('s')
        .description('Show internal state')
        .action(async () => {
            console.log(state)
        })

    chatProgram
        .command('debug')
        .description('Show debugging info about last call')
        .action(async () => {
            console.log(state.config.debugger.render())
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
        // .option('-v', 'Show full')
        .description('Show chat history')
        .action(() => {
            if (!state.history?.length) {
                console.log('No chat history')
                return
            }
            Messages(state.history, { maxLength: 100 })
        })
}