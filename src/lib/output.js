import fs from 'fs/promises';
import path from 'path';

export async function writeOutput(content, outputDir, type = 'txt') {
  try {
    await fs.mkdir(outputDir, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = path.join(outputDir, `output-${timestamp}.${type}`);
    await fs.writeFile(filePath, content);
    return filePath;
  } catch (error) {
    throw new Error(`Failed to write output: ${error.message}`);
  }
}