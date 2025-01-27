import inquirer from 'inquirer'
import { CONTEXT_MODES } from '../../lib/config/Config.js'

export async function askContextMode(config) {
    const { contextMode } = await inquirer.prompt([{
        type: 'list',
        name: 'contextMode',
        message: 'Select context mode:',
        choices: Object.values(CONTEXT_MODES)
    }])
    config.contextMode = contextMode
    return contextMode
}

export async function list(context) {
    const { name } = await inquirer.prompt({
        type: 'list',
        name: 'name',
        ...context
    })
    return name
}
