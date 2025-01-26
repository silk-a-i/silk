import { Task } from '../lib/task.js'
import { Logger } from '../lib/logger.js'
import { createBasicTools } from '../lib/tools/basicTools.js'
import { CliRenderer } from '../lib/renderers/cli.js'
import fs from 'fs/promises'
import { postActions } from '../lib/silk.js'
import inquirer from 'inquirer'
import path from 'path'
import { loadConfig } from '../lib/config/load.js'

export function installParse(program) {
  program
    .command('parse')
    .alias('p')
    .argument('[file]', 'file to parse')
    .option('-i, --interactive', 'interactive mode', '')
    .description('Parse markdown file into individual files')
    .action(parse)
}

export async function parse(filePath = "", options = {}) {
  const logger = new Logger()

  const config = await loadConfig(options)

  try {
    if (!filePath || options.interactive) {
      filePath = await promptForFile()
    }

    // Read input from stdin or file
    const content = filePath
      ? await fs.readFile(filePath, 'utf-8')
      : await readStdin()

    // Create task with basic tools
    const task = new Task({
      prompt: content,
      context: [],
      tools: createBasicTools(config)
    })

    // Create and attach renderer
    const renderer = new CliRenderer().attach(task.toolProcessor)

    // Process content directly without LLM
    task.toolProcessor.process(content)
    task.toolProcessor.cleanup()

    // Post actions
    await postActions(task)

    renderer.cleanup()
  } catch (error) {
    logger.error(`Failed to parse: ${error.message}`)
    process.exit(1)
  }
}

async function readStdin() {
  const chunks = []
  for await (const chunk of process.stdin) {
    chunks.push(chunk)
  }
  return Buffer.concat(chunks).toString('utf8')
}

async function promptForFile() {
  const files = await fs.readdir(process.cwd())
  const mdFiles = files.filter(file => path.extname(file) === '.md')

  if (mdFiles.length === 0) {
    throw new Error('No markdown files found in the current directory.')
  }

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'file',
      message: 'Select a markdown file to parse:',
      choices: mdFiles
    }
  ])

  return answers.file
}
