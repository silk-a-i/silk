import path from 'path'
import mime from 'mime-types'

export class File {
  path = ''
  size = 0
  content = ''

  constructor (obj = {}) {
    Object.assign(this, obj)
  }

  isBinary() {
    // Use mime-types for more accurate detection
    const mimeType = mime.lookup(this.path)
    
    // List of mime types considered binary
    const binaryMimeTypes = [
      'image/', 
      'audio/', 
      'video/', 
      'application/pdf',
      'application/zip',
      'application/gzip',
      'application/x-tar',
      'application/octet-stream',
      'application/x-executable',
      'application/x-sharedlib',
      'application/x-object'
    ]

    // Check mime type
    if (mimeType && binaryMimeTypes.some(type => mimeType.startsWith(type))) {
      return true
    }

    return false
  }

  render () {
    // Check if file is binary
    if (this.isBinary()) {
      return `##### \`${this.path}\`
[Binary file]
`
    }

    const ext = path.extname(this.path).slice(1) || 'txt'
    return `##### \`${this.path}\`
\`\`\`${ext}
${this.content}
\`\`\`
`
  }
}
