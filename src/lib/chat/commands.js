import { Chat } from "./chat.js"
import inquirer from 'inquirer'
import { Logger, Messages } from '../logger.js'
import { info } from '../../commands/info.js'
import { FileStats } from '../stats.js'
import { Config, CONTEXT_MODES } from '../config/Config.js'
import { getContext } from '../getContext.js'

const MOODS = ['brief', 'happy', 'sad', 'angry', 'professional', 'neutral', 'other']

export function setupCommands(ctx = new Chat) {
    const { chatProgram, logger, ui, state } = ctx

    chatProgram
        .command('exit')
        .description('Exit the chat')
        .action(() => {
            process.exit(0)
        })

    chatProgram
        .command('mode')
        .description('Set the context mode')
        .action(async () => {
            const { contextMode } = await inquirer.prompt([{
                type: 'list',
                name: 'contextMode',
                message: 'Select context mode:',
                choices: Object.values(CONTEXT_MODES)
            }])
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
            stats.summary({ showLargestFiles: -1 })
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