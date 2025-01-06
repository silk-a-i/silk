import fs from 'fs/promises'
import path from 'path'
import { Logger } from '../lib/logger.js'

export async function prepCommand (folder) {
  const logger = new Logger()

  try {
    // Create .silk folder if it doesn't exist
    const silkDir = path.join(folder, '.silk')
    await fs.mkdir(silkDir, { recursive: true })

    // Create design.md template
    const designPath = path.join(silkDir, 'design.md')
    const designContent = `# Design Document

## Overview
[Describe the project purpose and goals]

## Requirements
[List key requirements]

## Technical Specifications
[Add technical details]

## Files to Create
[List files that need to be created]

## Styling Guidelines
[Add styling preferences]

## Additional Notes
[Any other relevant information]
`

    await fs.writeFile(designPath, designContent)

    // Create config.json if it doesn't exist
    const configPath = path.join(silkDir, 'config.json')
    const configExists = await fs.access(configPath).then(() => true).catch(() => false)

    if (!configExists) {
      const configContent = {
        baseUrl: 'http://localhost:11434/v1',
        model: 'llama3.1',
        provider: 'ollama'
      }
      await fs.writeFile(configPath, JSON.stringify(configContent, null, 2))
    }

    // Create README.md with usage instructions
    const readmePath = path.join(folder, 'README.md')
    const readmeContent = `# ${path.basename(folder)}

This project was prepared using Silk CLI.

## Usage

To generate files based on the design document:

\`\`\`sh
silk build
\`\`\`
`

    await fs.writeFile(readmePath, readmeContent)

    logger.success('Project prepared successfully!')
    logger.info(`Created:
- .silk/design.md
- .silk/config.json
- README.md`)
  } catch (error) {
    logger.error(`Failed to prepare project: ${error.message}`)
    process.exit(1)
  }
}
