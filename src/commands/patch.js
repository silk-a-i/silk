import { doCommand } from './do.js';

export async function patchCommand(root, promptOrFile, options) {
  return doCommand(root, promptOrFile, {
    ...options,
    context: '**/*'
  });
}
