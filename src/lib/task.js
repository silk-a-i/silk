import { ToolProcessor } from './tools/ToolProcessor.js';
import { createBasicTools } from './tools/basicTools.js';

export class Task {
  constructor({ prompt, context = [], system = '', tools = [] }) {
    this.prompt = prompt;
    this.context = context;
    this.system = system;
    this.toolProcessor = new ToolProcessor(tools.length ? tools : createBasicTools());
  }

  get fullSystem() {
    const toolSystem = this.toolProcessor.getToolingPrompt();
    return `${this.system}${toolSystem}`;
  }

  async render() {
    const userPrompt = Array.isArray(this.prompt) ? 
      this.prompt.find(m => m.role === 'user')?.content || '' : 
      this.prompt;

    return `
# Intent
${userPrompt}

# Context (${this.context.length} files)
${this.context.map(file => file.render()).join('\n')}`;
  }
}
