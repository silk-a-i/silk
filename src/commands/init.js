import inquirer from 'inquirer'
import { createConfig } from '../lib/config/create.js'
import { Logger } from '../lib/logger.js'
import { INIT_PROViDERS as PROVIDERS } from '../lib/constants.js'
import fs from 'fs'
import path from 'path'
import { GET_STARTED } from './messages/index.js'

const OPTIONS = {
  yes: false
}

export function installInit(program) {
  program
    .command('init')
    .argument('[root]', 'root directory')
    .option('-y, --yes', 'yes')
    .description('Initialize a new Silk project')
    .action(init)
}

async function getAnswers(options) {
  if (options.yes) {
    return {
      root: '.',
      provider: Object.keys(PROVIDERS)[0],
      apiKey: '',
      model: PROVIDERS[Object.keys(PROVIDERS)[0]].defaultModel
    }
  } else {
    return await inquirer.prompt([
      {
        type: 'input',
        name: 'root',
        message: 'Project directory:',
        default: '.',
        validate: input => {
          if (!input) return 'Directory is required'
          return true
        }
      },
      {
        type: 'list',
        name: 'provider',
        message: 'Select your LLM provider:',
        choices: [
          ...Object.entries(PROVIDERS).map(([key, provider]) => ({
            name: provider.displayName || provider.name,
            value: key
          })),
          { name: 'Other (manual config)', value: 'other' }
        ]
      },
      {
        type: 'input',
        name: 'apiKey',
        message: 'Enter a custom API key (press enter to skip or use a global key):',
        when: (answers) => answers.provider !== 'other' && PROVIDERS[answers.provider]?.requiresApiKey,
        default: (answers) => PROVIDERS[answers.provider]?.requiresApiKey ? undefined : 'sk-dummy-key'
      },
      {
        type: 'list',
        name: 'model',
        message: 'Select the model:',
        default: (answers) => PROVIDERS[answers.provider]?.defaultModel,
        when: (answers) => answers.provider !== 'other',
        choices: (answers) => {
          const provider = PROVIDERS[answers.provider]
          return provider.models?.map(m => ({
            name: m.displayName || m.name,
            value: m.name
          })) || [provider.defaultModel]
        }
      }
    ])
  }
}

function createProjectDirectory(root) {
  if (root) {
    fs.mkdirSync(root, { recursive: true })
    process.chdir(root)
  }
}

function handleOtherProvider(logger, answers) {
  logger.info('\nPlease manually configure your provider in .silk/config.js')
  answers.model = 'openai/gpt-3.5-turbo'
  answers.apiKey = ''
}

async function createConfiguration(logger, answers) {
  const provider = PROVIDERS[answers.provider]
  const tag = `${provider.value}/${answers.model}`

  const config = {
    apiKey: answers.apiKey || '',
    model: tag,
    root: answers.root
  }

  if (!config.apiKey) {
    delete config.apiKey
  }

  const configPath = await createConfig(config, 'mjs')

  logger.success('Configuration created successfully!')
  logger.success(configPath)
  GET_STARTED()
}

export async function init (root = '', options = OPTIONS) {
  const logger = new Logger({ verbose: true })

  createProjectDirectory(root)

  try {
    const answers = await getAnswers(options)
    const projectDir = path.resolve(answers.root)
    fs.mkdirSync(projectDir, { recursive: true })

    if (answers.provider === 'other') {
      handleOtherProvider(logger, answers)
    }

    await createConfiguration(logger, answers)
  } catch (error) {
    logger.error(`Failed to initialize: ${error.message}`)
    process.exit(1)
  }
}
