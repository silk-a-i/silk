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
    return `${this.system}${this.toolProcessor.getToolingPrompt()}`;
  }

  render() {
    const userPrompt = Array.isArray(this.prompt) ? 
      this.prompt.find(m => m.role === 'user')?.content || '' : 
      this.prompt;

    return `# Intent\n${userPrompt}\n\n# Context (${this.context.length} files)\n${this.context.map(f => f.render()).join('\n')}`;
  }
}
