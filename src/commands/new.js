import { CommandOptions } from '../options.js'
import path from 'path'
import fs from 'fs/promises'
import { SILK_DIR } from '../lib/constants.js'
import { UI } from '../lib/logger.js'
import chalk from 'chalk'

const comment = (str = '') => `<!-- ${str} -->`

export function installNew(program) {
  program
    .command('new')
    .alias('n')
    .argument('[file]', 'file to parse')
    .description('Create a new design file')
    .action(newCommand)
}

const DESIGN_DOCUMENT = `# Design Document

## Overview
${comment('Describe the project purpose and goals')}

## Requirements
${comment('List key requirements')}

## Technical Specifications
${comment('Add technical details')}

## Files to Create
${comment('List files that need to be created')}

## Styling Guidelines
${comment('Add styling preferences')}

## Additional Notes
${comment('Any other relevant information')}
`

export async function newCommand(name = "design", options = new CommandOptions()) {
  await fs.mkdir(SILK_DIR, { recursive: true })

  const designPath = path.join(SILK_DIR, `${name}.md`)

  await fs.writeFile(designPath, DESIGN_DOCUMENT)

  UI.success('Document created successfully!')
  UI.info('Edit the file:', designPath)
  UI.info('\nYou can use Silk with the following commands:\n')
  UI.info(chalk.cyan(`  silk do ${name}`))
}
