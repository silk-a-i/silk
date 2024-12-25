import fs from 'fs/promises';
import path from 'path';

async function tryReadFile(filePath) {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return null;
  }
}
export async function extractPrompt(promptOrFile, configRoot = '.') {
  try {
    // If no prompt given, look for default files
    if (!promptOrFile) {
      const designPath = path.join(configRoot, 'design.md');
      const content = await tryReadFile(designPath);
      if (content) return content;

      const readmePath = 'README.md';
      const readmeContent = await tryReadFile(readmePath);
      if (readmeContent) return readmeContent;

      throw new Error('No prompt provided and no .silk/design.md or README.md found');
    }

    // Check if prompt is a file path
    const content = await tryReadFile(promptOrFile);
    if (content) return content;

    // Check if it's a prompt name in .silk folder
    const silkPath = path.join(configRoot, `${promptOrFile}.md`);
    const silkContent = await tryReadFile(silkPath);
    if (silkContent) return silkContent;

    // Treat as direct prompt
    return promptOrFile;

  } catch (error) {
    throw new Error(`Failed to extract prompt: ${error.message}`);
  }
}
