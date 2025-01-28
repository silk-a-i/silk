import { CommandHandler } from '../lib/CommandHandler.js'
import { loadConfig } from '../lib/config/load.js'
import { UI } from '../lib/logger.js'
import { extractPrompt } from '../lib/prompt-extractor.js'
import { logConfiguration } from './info.js'
import path from 'path'
import fs from 'fs/promises'
import { existsSync } from 'fs'
import inquirer from 'inquirer'
import { GET_STARTED } from './messages/index.js'
import { SILK_DIR } from '../lib/constants.js'
import { addSharedOptions } from '../options.js'
import { CONTEXT_MODES } from '../lib/config/Config.js'

export function installCreate(program) {
  addSharedOptions(
    program
      .command('create')
      .alias('c')
      .argument('<folder>', 'folder')
      .argument('[prompt]', 'prompt or file')
      .option('-y, --yes', 'yes')
      .option('-f, --force', 'force')
      .description('Create a new project.')
  ).action(create)
}

export function chdir(folder) {
  console.log(`Set working directory to: ./${folder}`)
  process.chdir(folder)
}

export async function create(folder = "", promptOrFile = "", options = {}) {
  options.root = folder
  const config = await loadConfig(options)

  const handler = new CommandHandler(config)
  logConfiguration(config, handler.logger)

  if (!options.force && existsSync(folder)) {
    UI.error(`Folder '${folder}' already exists`)
    process.exit(1)
  }
  
  // Create config directory
  // if (config.root) {
  const configDir = `${folder}/${SILK_DIR}`
    UI.info(`Creating directory: ${configDir}`)
    // handler.setupRoot(config.root)
    await fs.mkdir(configDir, { recursive: true })
    chdir(folder)
  // }

  const DEFAULTS = {
    makeDesignFile: true
  }

  let makeDesignFile = options.yes && DEFAULTS.makeDesignFile
  if (!makeDesignFile) {
    const answer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'createDesignFile',
        message: 'Do you want to create a design file?',
        default: true,
      },
    ])
    makeDesignFile = answer.createDesignFile
  }
  if (makeDesignFile) {
    const designPath = path.join(SILK_DIR, 'design.md')
    await fs.writeFile(designPath, createDesign({
      overview: promptOrFile
    }))
    UI.info(`Design file created: ${designPath}`)
  }

  const configRoot = path.dirname(config.configPath)
  if (promptOrFile) {
    const prompt = await extractPrompt(promptOrFile, configRoot)
    // Set to none as this is a fresh project
    config.contextMode = CONTEXT_MODES.NONE
    await handler.execute(prompt)
  }

  UI.success('Project created successfully!')
  UI.success(config.root)
  GET_STARTED()
  process.exit(0)
}

export const createDesign = ({
  overview = '[Describe the project purpose and goals]',
  requirements = '[List key requirements]',
  technicalSpecifications = '[Add technical details]',
  context = '[List files that need to be created]',
  stylingGuidelines = '[Add styling preferences]',
  additionalNotes = '[Any other relevant information]'
} = {}) => `# Design Document

## Overview
${overview}

## Requirements
${requirements}

## Technical Specifications
${technicalSpecifications}

## Context
${context}

## Styling Guidelines
${stylingGuidelines}

## Additional Notes
${additionalNotes}
`