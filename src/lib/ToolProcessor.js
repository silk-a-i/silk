import { EventEmitter } from 'events'
import { SYSTEM } from './prompt.js'
import { Tool } from './Tool.js'

export class ToolProcessor extends EventEmitter {
  tagName = 'silk.action'

  constructor (tools = []) {
    super()
    this.tools = new Map()
    this.buffer = ''
    this.queue = []

    // Track current state
    this.currentState = {
      inAction: false,
      inFileBlock: false,
      tool: null,
      args: {},
      blockContent: ''
    }

    tools.forEach(tool => this.register(tool))
  }

  register (tool = new Tool()) {
    const isFunctional = !tool._isTool
    if (isFunctional) {
      tool = new Tool().fromFunction(tool, this)
    }
    this.tools.set(tool.name, tool)
  }

  getToolingPrompt () {
    const availableTools = Array.from(this.tools.values())

    function list (arr) {
      return arr.map(item => `- ${item}`).join('\n')
    }

    return `
${SYSTEM}

# Available Tools
${list(availableTools.map(tool => tool.name))}

${availableTools.map(tool => tool.system).join('\n\n')}
`
  }

  process (chunk) {
    this.buffer += chunk

    this.emit('chunk', chunk, this.buffer)

    // Process complete lines
    const lines = this.buffer.split('\n')
    this.buffer = lines.pop() || '' // Keep last incomplete line in buffer

    for (const line of lines) {
      this.emit('line:end', line)

      this.processLine(line)
    }
  }

  processLine (line = '') {
    // Check for action start and end on the same line
    const actionStartEnd = line.match(new RegExp(`<${this.tagName}\\s+([^>]+)>([^<]*)</${this.tagName}>`))
    if (actionStartEnd) {
      const args = this.extractArgs(actionStartEnd[1])
      this.startAction(args)
      this.currentState.blockContent = actionStartEnd[2] || ''
      this.endAction()
      return
    }
    // Check for action start
    const actionStart = line.match(new RegExp(`<${this.tagName}\\s+([^>]+)>`))
    if (actionStart) {
      const args = this.extractArgs(actionStart[1])
      this.startAction(args)
      return
    }
  
    // Check for action end
    if (line.includes(`</${this.tagName}>`)) {
      this.endAction()
      return
    }
  
    // Check for file block start
    const fileBlockStart = line.match(/#{5}\s+`([^`]+)`/)
    if (fileBlockStart) {
      const [, path] = fileBlockStart
      this.startFileBlock({ path })
      return
    }
  
    // Check for file block content markers
    if (this.currentState.inFileBlock) {
      if (line.startsWith('```')) {
        if (this.currentState.blockContent) {
          this.endFileBlock()
        }
        return
      }
    }
  
    // Accumulate content
    if (this.currentState.inAction || this.currentState.inFileBlock) {
      this.currentState.blockContent += line + '\n'
      const { tool } = this.currentState
      if (tool) {
        tool.emit('progress', { ...this.currentState, line })
      }
      this.emit('tool:progress', { ...this.currentState, line })
    } else {
      // Regular text
      this.emit('text', line + '\n')
    }
  }

  extractArgs (argString) {
    const args = {}
    const regex = /(\w+)="([^"]+)"/g
    let match
    while ((match = regex.exec(argString)) !== null) {
      args[match[1]] = match[2]
    }
    return args
  }

  startAction (args) {
    const tool = this.tools.get(args.tool)
    if (!tool) return

    this.currentState = {
      inAction: true,
      inFileBlock: false,
      tool,
      args,
      blockContent: ''
    }

    tool.emit('start', { ...args, tool })
    this.emit('tool:start', { ...args, tool })
  }

  endAction () {
    const { tool = new Tool(), args, blockContent } = this.currentState
    if(!tool) {
      throw new Error('Tool not found')
    }
    const payload = { ...args, tool, content: blockContent }
    tool.emit('finish', payload, this)
    this.emit('tool:finish', payload)

    this.resetState()
  }

  startFileBlock (args) {
    const tool = this.tools.get('create')
    if (!tool) return

    this.currentState = {
      inAction: false,
      inFileBlock: true,
      tool,
      args,
      blockContent: ''
    }

    this.emit('tool:start', { ...args, tool })
  }

  endFileBlock () {
    const { tool, args, blockContent } = this.currentState
    if (tool) {
      tool.onFinish({ ...args, content: blockContent })
      this.emit('tool:finish', {
        ...args,
        tool,
        content: blockContent
      })
    }

    this.resetState()
  }

  resetState () {
    this.currentState = {
      inAction: false,
      inFileBlock: false,
      tool: null,
      args: {},
      blockContent: ''
    }
  }

  cleanup () {
    // Process any remaining content in buffer
    if (this.buffer) {
      this.processLine(this.buffer)
      this.buffer = ''
    }

    // Ensure any open actions/blocks are closed
    if (this.currentState.inAction) {
      this.endAction()
    } else if (this.currentState.inFileBlock) {
      this.endFileBlock()
    }
  }
}
