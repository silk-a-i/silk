import fs from 'fs/promises'
// import { rawlist } from '@inquirer/prompts'
import path from 'path'
import { Config } from '../../lib/config/Config.js'
import inquirer from 'inquirer'
import { list } from './interactive.js'

export async function promptForFile(config = new Config()) {
    const files = await fs.readdir(process.cwd())
    const mdFiles = files.filter(file => path.extname(file) === '.md')

    // Also read from project root
    const projectRoot = config.configDir
    if(projectRoot) {
        const projectFiles = await fs.readdir(projectRoot)
        const projectMdFiles = projectFiles.filter(file => path.extname(file) === '.md')
        mdFiles.push(...projectMdFiles)
    }

    if (mdFiles.length === 0) {
        throw new Error('No markdown files found in the current directory.')
    }

    const answers = await list(
        {
            message: 'Select a markdown file to parse:',
            choices: mdFiles
        }
    )

    return answers.file
}
