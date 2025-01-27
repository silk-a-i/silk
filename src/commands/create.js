import { CommandHandler } from '../lib/CommandHandler.js'
import { loadConfig } from '../lib/config/load.js'
import { UI } from '../lib/logger.js'
import { extractPrompt } from '../lib/prompt-extractor.js'
import { logConfiguration } from './info.js'
import path from 'path'
import fs from 'fs/promises';
import inquirer from 'inquirer';
import { GET_STARTED } from './messages/index.js'
import { SILK_DIR } from '../lib/constants.js'
import { addSharedOptions } from '../options.js'

export function installCreate(program) {
  addSharedOptions(
    program
      .command('create')
      .alias('c')
      .argument('<folder>', 'folder')
      .argument('[prompt]', 'prompt or file')
      .option('-y, --yes', 'yes')
      .description('Create a new project.')
  ).action(create)
}

export async function create(folder = "", promptOrFile = "", options = {}) {
  options.root = folder
  const config = await loadConfig(options)

  const handler = new CommandHandler(config)
  logConfiguration(config, handler.logger)

  // Create config directory
  // if (config.root) {
  const configDir = `${folder}/${SILK_DIR}`
    UI.info(`Creating directory: ${configDir}`)
    // handler.setupRoot(config.root)
    await fs.mkdir(configDir, { recursive: true })
  // }

  const DEFAULTS = {
    makeDesignFile: true
  }

  let makeDesignFile = options.yes && DEFAULTS.makeDesignFile;
  if (!makeDesignFile) {
    const answer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'createDesignFile',
        message: 'Do you want to create a design file?',
        default: true,
      },
    ]);
    makeDesignFile = answer.createDesignFile;
  }
  if (makeDesignFile) {
    await createDesignFile(config.root)
  }

  const configRoot = path.dirname(config.configPath)
  if (promptOrFile) {
    const prompt = await extractPrompt(promptOrFile, configRoot)
    handler.execute(prompt)
  }

  UI.success('Project created successfully!')
  UI.success(config.root)
  GET_STARTED()
}

async function createDesignFile(silkDir) {
  const designPath = path.join(silkDir, 'design.md');

  await fs.writeFile(designPath, designContent);
}

const designContent = `# Design Document
  
  ## Overview
  [Describe the project purpose and goals]
  
  ## Requirements
  [List key requirements]
  
  ## Technical Specifications
  [Add technical details]
  
  ## Files to Create
  [List files that need to be created]
  
  ## Styling Guidelines
  [Add styling preferences]
  
  ## Additional Notes
  [Any other relevant information]
  `;