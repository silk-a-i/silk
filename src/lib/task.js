import { ToolProcessor } from './tools/ToolProcessor.js';
import { basicTools } from './tools/basicTools.js';
import { executePrompt } from './llm.js';
import fs from 'fs/promises';
import { glob } from 'glob';
import path from 'path';
// File utilities
export async function loadPromptFromFile(filePath) {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to read prompt file: ${error.message}`);
  }
}

export async function isFile(path) {
  try {
    const stats = await fs.stat(path);
    return stats.isFile();
  } catch {
    return false;
  }
}

// Context gathering
export async function gatherContext(contextGlob, options = {}) {
  if (!contextGlob) return [];
  
  try {
    const files = await glob(contextGlob, {
      ignore: [
        'node_modules/**', 'dist/**', 'build/**', 
        'coverage/**', 'test/**', ".silk/**", ".silk.json", ".silk.md",
        '.env', '.gitignore', '.DS_Store', 'yarn.lock', 'package-lock.json',
        ...options.ignore || []
      ],
      ...options
    });
    return files.map(file => ({
      path: path.relative(process.cwd(), file)
    }));
  } catch (error) {
    console.warn(`Warning: Error gathering context: ${error.message}`);
    return [];
  }
}

// File rendering
export function renderFile({ path = '', content = '' }) {
  const extension = path.split('.').pop();
  return `***${path}***
\`\`\`${extension}
${content}
\`\`\``;
}

export class Task {
  constructor({ prompt, context = [], system = '' }) {
    this.prompt = prompt;
    this.context = context;
    this.system = system;
    this.toolProcessor = new ToolProcessor(basicTools);
  }

  get fullSystem() {
    const toolSystem = this.toolProcessor.getToolingPrompt();
    return `${this.system}${toolSystem}`;
  }

  async execute(options = {}) {
    const result = await executePrompt(
      this.prompt,
      (chunk) => this.toolProcessor.process(chunk),
      { ...options, system: this.fullSystem }
    );

    this.toolProcessor.cleanup();
    return result;
  }

  async resolveContext() {
    const resolved = await Promise.all(
      this.context.map(async (mixed) => {
        const path = typeof mixed === 'string' ? mixed : mixed.path;
        try {
          // Resolve content if missing
          const content = mixed.content || await fs.readFile(path, 'utf8');
          return {
            path,
            content,
            size: content.length
          };
        } catch (error) {
          console.warn(`Warning: Could not read file ${path}: ${error.message}`);
          return null;
        }
      })
    );
    return resolved.filter(Boolean); // Remove null entries
  }

  async render() {
    const resolvedContext = await this.resolveContext();
    return `
# Intent
${this.prompt}

# Context (${resolvedContext.length} files)
${resolvedContext.map(renderFile).join('\n')}`;
  }
}