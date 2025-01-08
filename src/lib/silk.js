import { CommandHandler } from './CommandHandler.js'
import { loadConfig } from './config/load.js'
import { Logger } from './logger.js'

export async function silk(prompt = '', options) {
    const config = await loadConfig(options)

    return new CommandHandler(config).execute(prompt)
}

const MOCK_CTX = {
    state: {
        history: []
    }
}

export async function postActions(task, ctx = MOCK_CTX, logger = new Logger) {
    const { queue } = task?.toolProcessor
    for (const task of queue) {
        try {
            await task(ctx)
        } catch (error) {
            logger.error(`Error: ${error.message}`)
        }
    }
}