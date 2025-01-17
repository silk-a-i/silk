import { Logger } from "./logger.js"

export class FileStats {
  files = new Set()

  addFile (filePath, metadata = { size: 0 }) {
    this.files.add({ filePath, metadata })
  }

  summary ({ showLargestFiles = 3 } = {}, {logger = new Logger} = {}) {
    let totalSize = 0
    const byExtension = {}
    const sizeByExtension = {}

    this.files.forEach(({ filePath, metadata }) => {
      const size = metadata.size || 0
      const ext = getExtension(filePath)

      totalSize += size
      byExtension[ext] = (byExtension[ext] || 0) + 1
      sizeByExtension[ext] = (sizeByExtension[ext] || 0) + size
    })

    logger.stats('Context stats', [
      { label: 'Total size', value: formatBytes(totalSize) },
      { label: 'Files', value: this.files.size }
    ])

    if (Object.keys(byExtension).length > 0) {
      logger.stats('Files by Type',
        Object.entries(byExtension)
          .sort(([, a], [, b]) => b - a)
          .map(([ext, count]) => ({
            label: ext,
            value: `${count} (${formatBytes(sizeByExtension[ext])})`
          }))
      )
    }

    if (this.files.size > 0) {
      const largestFiles = Array.from(this.files)
        .sort((a, b) => b.metadata.size - a.metadata.size)
        .slice(0, showLargestFiles)
        .map(({ filePath, metadata }) => ({
          label: filePath,
          value: formatBytes(metadata.size)
        }))

      const remainingFilesCount = this.files.size - showLargestFiles
      if (remainingFilesCount > 0) {
        largestFiles.push({ raw: `+ ${remainingFilesCount} more files` })
      }

      logger.stats('Files by size', largestFiles)
    }
  }
}

export function formatBytes (bytes = 0) {
  if (bytes === 0) return '0 KB'
  const sizes = ['KB', 'MB', 'GB']
  const i = Math.max(0, Math.floor(Math.log(bytes) / Math.log(1024)) - 1)
  return `${(bytes / Math.pow(1024, i + 1)).toFixed(1)} ${sizes[i]}`
}

function getExtension (filePath) {
  const ext = filePath.split('.').pop() || 'no-ext'
  return ext.toLowerCase()
}
