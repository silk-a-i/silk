import inquirer from 'inquirer'
import fs from 'fs'
import path from 'path'
import { homedir } from 'os'
import { Logger } from '../lib/logger.js'

export function installLogin(program) {
  program
    .command('login')
    .argument('[key]', 'key')
    .description('Configure API key')
    .option('-i, --interactive', 'Interactive mode')
    .action(login)
}

export async function login (key = '', options = {}) {
  options.interactive = options.interactive || true

  async function ask () {
    const answers = await inquirer.prompt([{
      type: 'input',
      name: 'apiKey',
      message: 'Enter your API key:',
      validate: input => input ? true : 'API key is required'
    }])
    return answers
  }

  async function askOverwrite () {
    const answers = await inquirer.prompt([{
      type: 'confirm',
      name: 'overwrite',
      message: '.env file already exists. Do you want to overwrite it?',
      default: false
    }])
    return answers.overwrite
  }

  const logger = new Logger({
    verbose: true,
    ...options
  })
  const configDir = path.join(homedir(), '.config', 'silk')
  const envPath = path.join(configDir, '.env')

  // Create config directory if it doesn't exist
  fs.mkdirSync(configDir, { recursive: true })

  if (!key) {
    const answers = await ask()
    key = answers.apiKey
  }

  if (fs.existsSync(envPath)) {
    const overwrite = await askOverwrite()
    if (!overwrite) {
      logger.info('Operation cancelled by the user.')
      return
    }
  }

  fs.writeFileSync(envPath, `SILK_API_KEY=${key}\n`)
  logger.success(`API key saved successfully to ${envPath}`)
}
