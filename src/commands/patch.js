import { doCommand } from './do.js';

export async function patchCommand(root, promptOrFile, options) {
  const patchOptions = {
    ...options,
    // output: root || '.', // Root directory or current directory
    context: '**/*', // All files
  };

  // Use the same doCommand with patch-specific options
  return doCommand(root, promptOrFile, patchOptions);
}
