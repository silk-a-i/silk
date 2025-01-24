import { CommandHandler } from '../lib/CommandHandler.js'
import { addSharedOptions, CommandOptions } from '../lib/CommandOptions.js'
import { loadConfig } from '../lib/config/load.js'
import { extractPrompt } from '../lib/prompt-extractor.js'
import { promptForFile } from './helpers/helpers.js'
import { askContextMode } from './helpers/interactive.js'
import { logConfiguration } from './info.js'
import path from 'path'

export function installRun(program) {
  addSharedOptions(
    program
      .command('run')
      .alias('do')
      .argument('[prompt]', 'prompt or file')
      .description('Execute a single task')
  ).action(run)

  addSharedOptions(
    program
      .command('change')
      .argument('[file]', 'source file')
      .argument('[prompt]', 'prompt or file')
      .description('Execute a task on a single file')
      .action((file, promptOrFile = '', options) => {
        run(promptOrFile, {
          ...options,
          context: file // Override context to be empty
        })
      })
  )

  addSharedOptions(
    program
      .command('ask')
      .argument('[prompt]', 'prompt or file')
      .description('Execute a task without additional context')
      .action((promptOrFile, options) => {
        run(promptOrFile, {
          ...options,
          context: '' // Override context to be empty
        })
      })
  )
}

export async function run(promptOrFile = "", options = new CommandOptions()) {
  const config = await loadConfig(options)

  const handler = new CommandHandler(config)
  logConfiguration(config, handler.logger)
  
  const configRoot = path.dirname(config.configPath)

  if(options.interactive) {
    await askContextMode(config)
  }

  const prompt = promptOrFile ? await extractPrompt(promptOrFile, configRoot) : await promptForFile(config)
  handler.execute(prompt)
}
