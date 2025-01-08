import { CommandHandler } from './CommandHandler.js'
import { loadConfig } from './config/load.js'

export async function silk(prompt = '', options) {
    const config = await loadConfig(options)

    return new CommandHandler(config).execute(prompt)
}

const MOCK_STATE = {
    history: []
}

export async function postActions(task, { state = MOCK_STATE, logger }) {
    // Any tasks in the queue?
    const { queue } = task?.toolProcessor
    for (const task of queue) {
        try {
            await task(state)
        } catch (error) {
            logger.error(`Error: ${error.message}`)
        }
    }
}