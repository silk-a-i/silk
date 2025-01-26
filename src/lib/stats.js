import { Logger } from "./logger.js"
import { formatBytes, limit } from "./renderers/utils.js"

export class FileStats {
  files = new Set()

  addFile (filePath, metadata = { size: 0 }) {
    this.files.add({ filePath, metadata })
  }

  summary (options = {}, { logger = new Logger() } = {}) {
    const summaryData = generateSummary(this.files, options)
    renderSummary(summaryData, options, logger)
  }
}

export function generateSummary(files, options = {}) {
  let totalSize = 0
  const byExtension = {}
  const sizeByExtension = {}

  files.forEach(({ filePath, metadata }) => {
    const size = metadata.size || 0
    const ext = getExtension(filePath)

    totalSize += size
    byExtension[ext] = (byExtension[ext] || 0) + 1
    sizeByExtension[ext] = (sizeByExtension[ext] || 0) + size
  })

  return {
    totalSize,
    byExtension,
    sizeByExtension,
    files
  }
}

function renderSummary(summaryData, { showLargestFiles = 3 } = {}, logger) {
  const { totalSize, byExtension, sizeByExtension, files } = summaryData
  const filesArray = Array.from(files)
  const filesCount = filesArray.length

  const largestFiles = filesArray
    .sort((a, b) => b.metadata.size - a.metadata.size)
    .map(({ filePath, metadata }) => ({
      label: filePath,
      value: formatBytes(metadata.size)
    }))

  logger.stats('Context stats', [
    { label: 'Total size', value: formatBytes(totalSize) },
    { label: 'Files', value: filesCount }
  ])

  if (Object.keys(byExtension).length > 0) {
    const fileByTypes = Object.entries(byExtension)
      .sort(([, a], [, b]) => b - a)
      .map(([ext, count]) => ({
        label: ext,
        value: `${count} (${formatBytes(sizeByExtension[ext])})`
      }))
    logger.stats('Files by Type', limit(fileByTypes, 5))
  }

  if (filesCount > 0) {
    logger.stats('Files by size', limit(largestFiles, showLargestFiles))
  }
}

function getExtension(filePath) {
  const ext = filePath.split('.').pop() || 'no-ext'
  return ext.toLowerCase()
}

export class LLMStats {
  totalBytes = 0
  textBytes = 0
  actions = 0
  startTime = Date.now()

  get elapsedTime() {
    return ((Date.now() - this.startTime) / 1000).toFixed(1)
  }
}
