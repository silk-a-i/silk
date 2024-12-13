import fs from 'fs/promises';
import path from 'path';
import { Tool } from './Tool.js';

export function createBasicTools(options = {}) {
  const outputDir = options.output || '';
  
  return [
    new Tool({
      name: 'create',
      description: 'Create a new file',
      pattern: /<silk\.action\s+tool="create"/,
      async onFinish(ctx) {
        const fullPath = path.join(outputDir, ctx.path);
        const dir = path.dirname(fullPath);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(fullPath, ctx.content);
      }
    }),

    new Tool({
      name: 'modify',
      description: 'Modify an existing file',
      pattern: /<silk\.action\s+tool="modify"/,
      async onFinish(ctx) {
        const fullPath = path.join(outputDir, ctx.path);
        
        try {
          // Check if file exists
          await fs.access(fullPath);
          await fs.writeFile(fullPath, ctx.content);
        } catch (error) {
          throw new Error(`Cannot modify ${fullPath}: file does not exist`);
        }
      }
    })
  ];
}
