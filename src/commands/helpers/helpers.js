import fs from 'fs/promises'
import path from 'path'
import { Config } from '../../lib/config/Config.js'
import { list } from './interactive.js'
import { SILK_DIR } from '../../lib/constants.js'

export async function promptForFile(config = new Config()) {
    const files = await fs.readdir(process.cwd())
    const mdFiles = files.filter(file => path.extname(file) === '.md')

    // Also read from project root
    const projectRoot = config.configDir
    if(projectRoot) {
        const projectFiles = await fs.readdir(projectRoot)
        const projectMdFiles = projectFiles.filter(file => path.extname(file) === '.md')
        mdFiles.push(...projectMdFiles.map(file => path.join(SILK_DIR, file)))
    }

    if (mdFiles.length === 0) {
        throw new Error('No markdown files found in the current directory.')
    }

    const answer = await list(
        {
            message: 'Select a markdown file to parse:',
            choices: mdFiles
        }
    )

    // Read file
    const file = await fs.readFile(answer, 'utf-8')
    return file
}
