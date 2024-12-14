import { EventEmitter } from 'events';
import { silkPrompt } from './prompt.js';

export class ToolProcessor extends EventEmitter {
  constructor(tools = []) {
    super();
    this.tools = new Map();
    this.buffer = '';

    // Track current state
    this.currentState = {
      inAction: false,
      inFileBlock: false,
      currentTool: null,
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
    ${silkPrompt}

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
    const actionStart = line.match(/<silk\.action\s+([^>]+)>/);
    if (actionStart) {
      const args = this.extractArgs(actionStart[1]);
      this.startAction(args);
      return;
    }

    // Check for action end
    if (line.includes('</silk.action>')) {
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
      currentTool: tool,
      args,
      blockContent: ''
    };

    this.emit('tool:start', { tool, ...args });
  }

  endAction() {
    const { currentTool, args, blockContent } = this.currentState;
    if (currentTool) {
      currentTool.onFinish({ ...args, content: blockContent });
      this.emit('tool:finish', { 
        ...args,
        tool: currentTool, 
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
      currentTool: tool,
      args,
      blockContent: ''
    };

    this.emit('tool:start', { tool, ...args });
  }

  endFileBlock() {
    const { currentTool, args, blockContent } = this.currentState;
    if (currentTool) {
      currentTool.onFinish({ ...args, content: blockContent });
      this.emit('tool:finish', {
        ...args,
        tool: currentTool,
        content: blockContent
      });
    }

    this.resetState();
  }

  resetState() {
    this.currentState = {
      inAction: false,
      inFileBlock: false,
      currentTool: null,
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
