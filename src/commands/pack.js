import fs from 'fs/promises'
import path from 'path'
import { globby } from 'globby'
import { Logger } from '../lib/logger.js'
import { File } from '../lib/File.js'
import { getGlobOptions } from '../lib/fs.js'
import { FileStats } from '../lib/stats.js'
import { formatBytes } from '../lib/renderers/utils.js'

export function installPack(program) {
  program
    .command('pack')
    .argument('<folder>', 'folder to pack')
    .option('-o, --output <file>', 'output file', 'packed.md')
    .description('Pack folder contents into a single markdown file')
    .action(pack)
}

export async function pack (folder = "", options = {}) {
  const logger = new Logger()

  const output = options.output || 'packed.md'
  try {
    // const config = await loadConfig(options)

    const globOptions = await getGlobOptions({
      cwd: folder,
      ignore: [output]
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

    const outputPath = path.resolve(output)
    await fs.writeFile(outputPath, content)

    logger.success(`\nPacked ${files.length} files into ${outputPath}`)

    // Add output file size to stats summary
    logger.stats('Output', [{
      label: path.basename(outputPath),
      value: formatBytes(Buffer.from(content).length)
    }])

    stats.summary(undefined, {logger})
  } catch (error) {
    logger.error(`Failed to pack folder: ${error.message}`)
    process.exit(1)
  }
}