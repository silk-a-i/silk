import { Logger } from "./logger.js"

export class FileStats {
  totalSize = 0
  byExtension = {}
  sizeByExtension = {}
  /** @type {null | { path: string, size: number }} */
  largestFile = null
  fileMetadata = new Map() // Store file metadata

  addFile (filePath, metadata = { size: 0 }) {
    const size = metadata.size || 0
    const ext = getExtension(filePath)

    this.totalSize += size
    this.byExtension[ext] = (this.byExtension[ext] || 0) + 1
    this.sizeByExtension[ext] = (this.sizeByExtension[ext] || 0) + size

    if (size > (this.largestFile?.size || 0)) {
      this.largestFile = { path: filePath, size }
    }

    // Store metadata
    this.fileMetadata?.set(filePath, {
      createdAt: metadata.createdAt || new Date(),
      modifiedAt: metadata.modifiedAt || new Date(),
      ...metadata
    })
  }

  summary ({ showLargestFiles = 3 } = {}, {logger = new Logger} = {}) {
    logger.stats('Context stats', [
      { label: 'Total size', value: formatBytes(this.totalSize) },
      { label: 'Files', value: Object.values(this.byExtension).reduce((a, b) => a + b, 0) }
    ])

    if (Object.keys(this.byExtension).length > 0) {
      logger.stats('Files by Type',
        Object.entries(this.byExtension)
          .sort(([, a], [, b]) => b - a)
          .map(([ext, count]) => ({
            label: ext,
            value: `${count} (${formatBytes(this.sizeByExtension[ext])})`
          }))
      )
    }

    if (this.fileMetadata && this.fileMetadata.size > 0) {
      const largestFiles = Array.from(this.fileMetadata.entries())
      .sort(([, a], [, b]) => b.size - a.size)
      .slice(0, showLargestFiles)
      .map(([path, { size }]) => ({
        label: path,
        value: formatBytes(size)
      }))

      const remainingFilesCount = this.fileMetadata.size - showLargestFiles
      if (remainingFilesCount > 0) {
        largestFiles.push({ label: `+ ${remainingFilesCount} more files`, value: '' })
      }

      logger.stats('Files by size', largestFiles)
    }
  }
}

export function formatBytes (bytes) {
  if (bytes === 0) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}

function getExtension (filePath) {
  const ext = filePath.split('.').pop() || 'no-ext'
  return ext.toLowerCase()
}
