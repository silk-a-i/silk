import fs from 'fs/promises';
import path from 'path';
import { Tool } from './Tool.js';

export const createTool = new Tool({
  name: 'create',
  description: 'Create a new file or update an existing file',
  pattern: /<silk\.action\s+tool="create"/,
  onStart: ({ path }) => {
    // console.log(`Creating ${path}...`);
  },
  async onFinish (ctx) {
    const { content } = ctx;
    const dir = path.dirname(ctx.path);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(ctx.path, content);
  }
});

export const diffTool = new Tool({
  name: 'diff',
  description: 'Apply changes to an existing file',
  pattern: /<silk\.action\s+tool="diff"/,
  onStart: ({ path }) => {
    // console.log(`Modifying ${path}...`);
  },
  onFinish: async ({ path, content }) => {
    // Apply diff logic here
  }
});

export const basicTools = [
  createTool,
  diffTool
];
