import { EventEmitter } from 'events';
import { SYSTEM } from './prompt.js';

export class ToolProcessor extends EventEmitter {
  tagName = 'silk.action';

  constructor(tools = []) {
    super();
    this.tools = new Map();
    this.buffer = '';

    // Track current state
    this.currentState = {
      inAction: false,
      inFileBlock: false,
      tool: null,
      args: {},
      blockContent: ''
    };

    tools.forEach(tool => this.register(tool));
  }

  register(tool) {
    this.tools.set(tool.name, tool);
  }

  getToolingPrompt() {
    const availableTools = Array.from(this.tools.values())
      .map(tool => `- ${tool.name}: ${tool.description}`)
      .join('\n');

    return `
    ${SYSTEM}

    # Available Tools
    ${availableTools}
    `;
  }

  process(chunk) {
    this.buffer += chunk;

    this.emit('chunk', chunk);

    // Process complete lines
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() || ''; // Keep last incomplete line in buffer

    for (const line of lines) {
      this.processLine(line);
    }
  }

  processLine(line) {
    // Check for action start
    const actionStart = line.match(new RegExp(`<${this.tagName}\\s+([^>]+)>`));
    if (actionStart) {
      const args = this.extractArgs(actionStart[1]);
      this.startAction(args);
      return;
    }

    // Check for action end
    if (line.includes(`</${this.tagName}>`)) {
      this.endAction();
      return;
    }

    // Check for file block start
    const fileBlockStart = line.match(/#{5}\s+`([^`]+)`/);
    if (fileBlockStart) {
      const [, path] = fileBlockStart;
      this.startFileBlock({ path });
      return;
    }

    // Check for file block content markers
    if (this.currentState.inFileBlock) {
      if (line.startsWith('```')) {
        if (this.currentState.blockContent) {
          this.endFileBlock();
        }
        return;
      }
    }

    // Accumulate content
    if (this.currentState.inAction || this.currentState.inFileBlock) {
      this.currentState.blockContent += line + '\n';
      this.emit('tool:progress', { ...this.currentState, line }); // Emit progress event
    } else {
      // Regular text
      this.emit('text', line + '\n');
    }
  }

  extractArgs(argString) {
    const args = {};
    const regex = /(\w+)="([^"]+)"/g;
    let match;
    while ((match = regex.exec(argString)) !== null) {
      args[match[1]] = match[2];
    }
    return args;
  }

  startAction(args) {
    const tool = this.tools.get(args.tool);
    if (!tool) return;

    this.currentState = {
      inAction: true,
      inFileBlock: false,
      tool,
      args,
      blockContent: ''
    };

    this.emit('tool:start', { ...args, tool });
  }

  endAction() {
    const { tool, args, blockContent } = this.currentState;
    if (tool) {
      tool.onFinish({ ...args, content: blockContent });
      this.emit('tool:finish', { 
        ...args,
        tool, 
        content: blockContent 
      });
    }

    this.resetState();
  }

  startFileBlock(args) {
    const tool = this.tools.get('create');
    if (!tool) return;

    this.currentState = {
      inAction: false,
      inFileBlock: true,
      tool,
      args,
      blockContent: ''
    };

    this.emit('tool:start', { ...args, tool });
  }

  endFileBlock() {
    const { tool, args, blockContent } = this.currentState;
    if (tool) {
      tool.onFinish({ ...args, content: blockContent });
      this.emit('tool:finish', {
        ...args,
        tool,
        content: blockContent
      });
    }

    this.resetState();
  }

  resetState() {
    this.currentState = {
      inAction: false,
      inFileBlock: false,
      tool: null,
      args: {},
      blockContent: ''
    };
  }

  cleanup() {
    // Process any remaining content in buffer
    if (this.buffer) {
      this.processLine(this.buffer);
      this.buffer = '';
    }

    // Ensure any open actions/blocks are closed
    if (this.currentState.inAction) {
      this.endAction();
    } else if (this.currentState.inFileBlock) {
      this.endFileBlock();
    }
  }
}
