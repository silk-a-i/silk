import { createWriteStream } from 'node:fs'
import { UI } from './lib/logger';

export const errorLogStream = createWriteStream('error.log', { flags: 'a' })

/**
 * @example process.on('uncaughtException', uncaughtException)
 * @param {*} error 
 */
export async function uncaughtException(error) {
    if (error instanceof Error && error.name === 'ExitPromptError') {
        console.log('👋 until next time!');
    } else {
        UI.error(`Error occurred: ${error.message}`)
        UI.error('For more details, check ./error.log')
        await errorLogStream.write(error.stack)
        process.exit(1)
    }
}