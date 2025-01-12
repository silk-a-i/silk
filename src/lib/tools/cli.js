import inquirer from 'inquirer'
import { exec } from 'child_process'
import { Tool } from './Tool.js'
import { ACTION_TAG } from '../prompt.js'
import chalk from 'chalk'

export const cliTool = new Tool({
    name: 'cli',
    version: '0.0.0beta',
    examples: `
<${ACTION_TAG} tool="cli" command="npm init"></${ACTION_TAG}>`,
    onFinish(res, tools) {
        console.log(res)
        tools.queue.push(async (ctx) => {
            // ask the user first using inquirer
            await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'confirm',
                    message: `Are you sure you want to run the command: \`${chalk.blue(res.command)}\`?`,
                    default: false
                }
            ]).then(answers => {
                if (answers.confirm) {
                    exec(res.command, (error, stdout, stderr) => {
                        if (error) {
                            console.error(`Error executing command: ${error.message}`)
                            return
                        }
                        if (stderr) {
                            console.error(`Command stderr: ${stderr}`)
                            return
                        }
                        console.log(`Command stdout: ${stdout}`)
                    })
                } else {
                    console.log('Command execution cancelled by user.')
                }
            })
        })
    }
})

export default cliTool