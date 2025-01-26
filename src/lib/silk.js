import { AIClient } from './ai/client.js'
import { CommandHandler } from './CommandHandler.js'
import { Config } from './config/Config.js'
import { loadConfig } from './config/load.js'
import { execute, streamHandler } from './llm.js'
import { Logger, UI } from './logger.js'
import { Task } from './task.js'
import { ToolProcessor } from './ToolProcessor.js'

export async function silk(prompt = '', options) {
    const config = await loadConfig(options)

    return new CommandHandler(config).execute(prompt)
}

class State {
    config = new Config()
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
    return finishToolQueue(queue, ctx, logger)
}

export async function finishToolQueue(queue = [], ctx = MOCK_CTX, logger = new Logger) {
    for (const task of queue) {
        try {
            await task(ctx)
        } catch (error) {
            logger.error(`Error: ${error.message}`)
        }
    }
}

// const TASK = {
//     intend: '',
//     /** @type {Array[Object]} */
//     context: []
// }

export function getMessagesFromTask(task = {}) {
    const _task = new Task(task)
    return [
        { role: 'system', content: _task.fullSystem },
        { role: 'user', content: _task.render() }
    ]
}

export function getSilkFromConfig(config = new Config) {
    const state = new State({
        config
    })

    return {
        state,
        async run(messages = [], toolProcessor = new ToolProcessor) {
            const { stream } = await execute(messages, config)

            const content = await streamHandler(stream, chunk => {
                toolProcessor.process(chunk)
            })
            toolProcessor.cleanup()
            return content
        },
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