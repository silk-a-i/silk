import fs from 'node:fs'
import path from 'path'
import { Tool } from '../Tool.js'
import { ACTION_TAG } from '../prompt.js'
import { inquirerPlugin } from './inquirer/inquirer.js'
import cliTool from './cli.js'
import { installSurgeonAction } from './surgeon/surgeon.js'
import { Config } from '../config/Config.js'

export function createBasicTools(config = new Config(), { tag = ACTION_TAG } = {}) {
  const outputDir = config.output || ''

  const tools = [
    new Tool({
      name: 'create',
      description: 'Create a new file',
      examples: `
> IMPORTANT always return the full content of the file

<${tag} tool="create" path="index.html">
  <div>Hello World</div>
</${tag}>`,
      onFinish(ctx) {
        const fullPath = path.join(outputDir, ctx.path)
        const dir = path.dirname(fullPath)
        fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(fullPath, ctx.content)
      }
    }),

    new Tool({
      name: 'modify',
      description: 'Modify an existing file',
      examples: `
<${tag} tool="modify" path="style.css">
  body {
    color: blue;
  }
</${tag}>`,
      onFinish(ctx) {
        const fullPath = path.join(outputDir, ctx.path)

        try {
          fs.accessSync(fullPath)
          fs.writeFileSync(fullPath, ctx.content)
        } catch (error) {
          throw new Error(`Cannot modify ${fullPath}: file does not exist`)
        }
      }
    }),

    new Tool({
      name: 'delete',
      description: 'Delete a file',
      examples: `
<${tag} tool="delete" path="style.css"></${tag}>`,
      onFinish(ctx) {
        const fullPath = path.join(outputDir, ctx.path)
        try {
          fs.unlinkSync(fullPath)
        } catch (error) {
          throw new Error(`Cannot delete ${fullPath}: ${error.message}`)
        }
      }
    }),

    cliTool
  ]

  if(config.provider === 'silk') {
    inquirerPlugin({ tools })
  
    installSurgeonAction({ tools })
  }

  return tools
}
