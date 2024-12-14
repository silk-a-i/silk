import fs from 'node:fs';
import path from 'path';
import { Tool } from './Tool.js';

export function createBasicTools(options = {}) {
  const outputDir = options.output || '';
  
  return [
    new Tool({
      name: 'create',
      description: 'Create a new file',
      pattern: /<silk\.action\s+tool="create"/,
      onFinish(ctx) {
        const fullPath = path.join(outputDir, ctx.path);
        const dir = path.dirname(fullPath);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(fullPath, ctx.content);
      }
    }),

    new Tool({
      name: 'modify',
      description: 'Modify an existing file',
      pattern: /<silk\.action\s+tool="modify"/,
      onFinish(ctx) {
        const fullPath = path.join(outputDir, ctx.path);
        
        try {
          fs.accessSync(fullPath);
          fs.writeFileSync(fullPath, ctx.content);
        } catch (error) {
          throw new Error(`Cannot modify ${fullPath}: file does not exist`);
        }
      }
    }),

    new Tool({
      name: 'delete',
      description: 'Delete a file',
      pattern: /<silk\.action\s+tool="delete"/,
      onFinish(ctx) {
        const fullPath = path.join(outputDir, ctx.path);
        try {
          fs.unlinkSync(fullPath);
        } catch (error) {
          throw new Error(`Cannot delete ${fullPath}: ${error.message}`);
        }
      }
    })
  ];
}
