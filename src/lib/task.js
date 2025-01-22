import { ToolProcessor } from './ToolProcessor.js'
import { createBasicTools } from './tools/basicTools.js'

export class Task {
  prompt = ''
  context = []
  system = ''
  toolProcessor = new ToolProcessor()

  constructor (ctx) {
    Object.assign(this, ctx)
    const { tools } = ctx
    this.toolProcessor = ctx.toolProcessor || new ToolProcessor(tools.length ? tools : createBasicTools())
  }

  get fullSystem () {
    return `${this.system}${this.toolProcessor?.getToolingPrompt()}`
  }

  get messages () {
    return [
      { role: 'system', content: this.fullSystem },
      { role: 'user', content: this.render() }
    ]
  }

  get _context () {
    return this.context.map(f => {
      if (f?.render) return f.render()

      return f
    })
  }

  render () {
    const userPrompt = Array.isArray(this.prompt)
      ? this.prompt.find(m => m.role === 'user')?.content || ''
      : this.prompt

    return `
# Intent
${userPrompt}

# Context (${this.context.length} items)
${this._context.join('\n\n')}
`
  }
}
