import fs from 'fs/promises'
import path from 'path'
import { globby } from 'globby'
import { Logger } from '../lib/logger.js'
import { File } from '../lib/File.js'
import { getGlobOptions } from '../lib/fs.js'
import { FileStats, formatBytes } from '../lib/stats.js'
import { loadConfig } from '../lib/config/load.js'

export async function pack (folder = "", options = {}) {
  const logger = new Logger()

  try {
    const config = await loadConfig(options)

    const globOptions = await getGlobOptions({
      cwd: folder,
      ignore: [options.output || 'packed.md']
    })

    const files = await globby('**/*', globOptions)

    if (files.length === 0) {
      logger.error('No files found to pack')
      process.exit(1)
    }

    let content = `# Packed Files from ${folder}\n\n`
    const stats = new FileStats()

    for (const filePath of files) {
      const fullPath = path.join(folder, filePath)
      const fileContent = await fs.readFile(fullPath, 'utf-8')

      stats.addFile(filePath, { size: fileContent.length })
      const file = new File({ path: filePath, content: fileContent })
      content += file.render()
    }

    const outputPath = path.resolve(options.output || 'packed.md')
    await fs.writeFile(outputPath, content)

    logger.success(`\nPacked ${files.length} files into ${outputPath}`)

    // Add output file size to stats summary
    logger.stats('Output', [{
      label: path.basename(outputPath),
      value: formatBytes(Buffer.from(content).length)
    }])

    stats.getSummary(logger)
  } catch (error) {
    logger.error(`Failed to pack folder: ${error.message}`)
    process.exit(1)
  }
}