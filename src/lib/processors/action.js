import { BaseProcessor } from './base.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * Parses an action XML string into an action object
 * @param {string} actionXml - The XML string containing the action
 * @returns {Object} The parsed action object
 */
export function parseAction(actionXml) {
  const typeMatch = actionXml.match(/do="([^"]+)"/);
  const fileMatch = actionXml.match(/file="([^"]+)"/);
  
  if (!typeMatch) {
    throw new Error('Action missing type attribute');
  }

  const type = typeMatch[1];
  const file = fileMatch ? fileMatch[1] : null;
  
  // Extract content between opening and closing tags
  const contentMatch = actionXml.match(/<action[^>]*>([\s\S]*?)<\/action>/);
  const content = contentMatch ? contentMatch[1].trim() : '';

  return {
    type,
    file,
    content
  };
}

export class ActionProcessor extends BaseProcessor {
  constructor(options = {}) {
    super(options);
    this.outputDir = options.output || '';
    this.buffer = '';
  }

  async process(content) {
    this.buffer += content;

    // Look for complete action tags
    const actionRegex = /<action[^>]*>[\s\S]*?<\/action>/g;
    let match;
    let lastIndex = 0;

    const fullContent = this.buffer;
    while ((match = actionRegex.exec(fullContent)) !== null) {
      const actionXml = match[0];
      try {
        await this.processAction(actionXml);
      } catch (error) {
        this.emit('error', error);
      }
      lastIndex = match.index + actionXml.length;
    }

    // Clear processed content from buffer
    if (lastIndex > 0) {
      this.buffer = this.buffer.slice(lastIndex);
    }

    return content;
  }

  async processAction(actionXml) {
    try {
      const action = parseAction(actionXml);

      switch (action.type) {
        case 'create':
          await this.handleCreateAction(action);
          break;
        case 'modify':
          await this.handleModifyAction(action);
          break;
        case 'delete':
          await this.handleDeleteAction(action);
          break;
        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }
    } catch (error) {
      throw new Error(`Failed to process action: ${error.message}`);
    }
  }

  async handleCreateAction(action) {
    if (!action.file) {
      throw new Error('Create action missing file attribute');
    }

    const filepath = path.join(this.outputDir, action.file);
    await fs.mkdir(path.dirname(filepath), { recursive: true });
    await fs.writeFile(filepath, action.content);
    
    this.emit('file-created', { filepath, content: action.content });
  }

  async handleModifyAction(action) {
    if (!action.file) {
      throw new Error('Modify action missing file attribute');
    }

    const filepath = path.join(this.outputDir, action.file);
    await fs.writeFile(filepath, action.content);
    this.emit('file-modified', { filepath, content: action.content });
  }

  async handleDeleteAction(action) {
    if (!action.file) {
      throw new Error('Delete action missing file attribute');
    }

    const filepath = path.join(this.outputDir, action.file);
    await fs.unlink(filepath);
    this.emit('file-deleted', { filepath });
  }

  getBuffer() {
    return this.buffer;
  }
}