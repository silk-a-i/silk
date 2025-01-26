import { loadConfig } from '../lib/config/load.js'
import { logConfiguration } from './info.js'
import { gatherContextInfo } from '../lib/fs.js'
import fs from 'fs/promises'
import { File } from '../lib/File.js'
import { Task } from '../lib/task.js'
import { Logger } from '../lib/logger.js'
import { CliRenderer } from '../lib/renderers/cli.js'
import { createBasicTools } from '../lib/tools/basicTools.js'
import { addSharedOptions, CommandOptions } from '../lib/CommandOptions.js'
import { execute, streamHandler } from '../lib/llm.js'

export function installMap(program) {
  addSharedOptions(
    program
      .command('each')
      .alias('map')
      .argument('[prompt]', 'prompt or file')
      .description('Run a prompt over multiple files')
  ).action(map)
}

export async function map (promptOrFile = "", options = new CommandOptions()) {
  const config = await loadConfig(options)

  const logger = new Logger(options)

  logConfiguration(config, logger)

  const files = await gatherContextInfo(config.include)

  if (files.length === 0) {
    logger.info(`No files found matching pattern: ${config.include}`)
    return
  }

  logger.info(`Found ${files.length} files to process`)

  for (const fileInfo of files) {
    logger.info(`\nProcessing: ${fileInfo.path}`)
    const content = await fs.readFile(fileInfo.path, 'utf-8')
    const file = new File(fileInfo.path, content)

    if (!options.dry) {
      const task = new Task({
        prompt: `${promptOrFile}\n\nFile to process: ${file.render()}`,
        context: [],
        tools: createBasicTools(config)
      })

      const renderer = new CliRenderer(options).attach(task.toolProcessor)

      const messages = [
        { role: 'system', content: task.fullSystem },
        { role: 'user', content: task.render() }
      ]
      const { stream } = await execute(messages, config)
      const content = await streamHandler(stream)
      renderer.cleanup()
    }
  }
}
