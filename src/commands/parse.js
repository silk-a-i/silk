import { Task } from '../lib/task.js'
import { Logger } from '../lib/logger.js'
import { createBasicTools } from '../lib/tools/basicTools.js'
import { CliRenderer } from '../lib/renderers/cli.js'
import fs from 'fs/promises'
import { postActions } from '../lib/silk.js'

export async function parse(filePath) {
  const logger = new Logger()

  try {
    // Read input from stdin or file
    const content = filePath
      ? await fs.readFile(filePath, 'utf-8')
      : await readStdin()

    // Create task with basic tools
    const task = new Task({
      prompt: content,
      context: [],
      tools: createBasicTools()
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
