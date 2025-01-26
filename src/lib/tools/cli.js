import inquirer from 'inquirer'
import { exec } from 'child_process'
import { Tool } from '../Tool.js'
import { ACTION_TAG } from '../prompt.js'
import chalk from 'chalk'

function execPromise(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error)
                return
            }
            resolve({ stdout, stderr })
        })
    })
}

export const cliTool = new Tool({
    name: 'cli',
    version: '0.0.0beta',
    examples: `
<${ACTION_TAG} tool="cli" command="npm init"></${ACTION_TAG}>`,
    onFinish(res, tools) {
        tools.queue.push(async (ctx) => {
            // ask the user first using inquirer
            const answers = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'confirm',
                    message: `Are you sure you want to run the command: \`${chalk.blue(res.command)}\`?`,
                    default: false
                }
            ])
            if (answers.confirm) {
                try {
                    const { stdout, stderr } = await execPromise(res.command)
                    if (stderr) {
                        console.error(`Command stderr:\n${stderr}`)
                        return
                    }
                    console.log(`Command stdout:\n${stdout}`)
                } catch (error) {
                    console.error(`Error executing command: ${error.message}`)
                }
            } else {
                console.log('Command execution cancelled by user.')
            }
        })
    }
})

export default cliTool