import { CommandHandler } from './CommandHandler.js'
import { loadConfig } from './config/load.js'

export async function silk(prompt = '', options) {
    const config = await loadConfig(options)

    return new CommandHandler(config).execute(prompt)
}