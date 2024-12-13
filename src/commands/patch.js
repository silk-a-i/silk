import { doCommand } from './do.js';

export async function patchCommand(prompt, options) {
  // Set default options for patch command
  const patchOptions = {
    ...options,
    output: '.', // Current directory
    context: '**/*', // All files
  };

  // Delegate to doCommand with modified options
  return doCommand(prompt, patchOptions);
}