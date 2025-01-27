export function formatBytes(bytes = 0) {
  if (bytes === 0) return '0 KB'
  const sizes = ['KB', 'MB', 'GB']
  const i = Math.max(0, Math.floor(Math.log(bytes) / Math.log(1024)) - 1)
  return `${(bytes / Math.pow(1024, i + 1)).toFixed(1)} ${sizes[i]}`
}

export function limit(array = [], maxLength = -1) {
  if (maxLength === -1) {
    return array
  }
  if (array.length > maxLength) {
    return array.slice(0, maxLength).concat({ raw: `+ ${array.length - maxLength} more items` })
  }
  return array
}
