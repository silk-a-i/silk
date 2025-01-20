import { config } from 'dotenv'
import { AIClient } from './ai/client.js'
import { CommandHandler } from './CommandHandler.js'
import { loadConfig } from './config/load.js'
import { streamHandler } from './llm.js'
import { Logger, UI } from './logger.js'

export async function silk(prompt = '', options) {
    const config = await loadConfig(options)

    return new CommandHandler(config).execute(prompt)
}

class State {
    config = {}
    /** Full messages state without any running messages */
    history = []
    
    constructor(obj = {}) {
        Object.assign(this, obj)
    }
}

const MOCK_CTX = {
    state: new State()
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

export function getSilkFromConfig(config = {}) {
    return {
        state: new State(),
        llm: async ({
            messages = []
        }) => {
            const client = new AIClient(config)
            const stream = await client.createCompletion({ messages })
            const content = await streamHandler(stream, chunk => {
                // process.stdout.write(chunk)
            })
            return content
        },
        ui: UI
    }
}