import { ToolProcessor } from './tools/ToolProcessor.js'
import { createBasicTools } from './tools/basicTools.js'

export class Task {
  constructor(ctx) {
    const { prompt = '',
      context = [], 
      system = '',
      tools = [],
      toolProcessor
    } = ctx
    this.prompt = prompt
    this.context = context
    this.system = system
    this.toolProcessor = toolProcessor || new ToolProcessor(tools.length ? tools : createBasicTools())
  }

  get fullSystem() {
    return `${this.system}${this.toolProcessor.getToolingPrompt()}`
  }

  get messages() {
    return [
      { role: 'system', content: this.fullSystem },
      { role: 'user', content: this.render() }
    ]
  }

  render() {
    const userPrompt = Array.isArray(this.prompt) ?
      this.prompt.find(m => m.role === 'user')?.content || '' :
      this.prompt

    return `# Intent\n${userPrompt}\n\n# Context (${this.context.length} files)\n${this.context.map(f => f.render()).join('\n')}`
  }
}
