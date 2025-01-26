import path from 'path'
import mime from 'mime-types'

/** List of mime types considered binary */
export const binaryMimeTypes = [
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

export class File {
  path = ''
  size = 0
  /** @type {String|null} */
  content = null

  constructor (obj = {}) {
    Object.assign(this, obj)

    this.mime = mime.lookup(this.path)
  }

  get isBinary() {
    // Use mime-types for more accurate detection
    const mimeType = mime.lookup(this.path)
    
    // Check mime type
    if (mimeType && binaryMimeTypes.some(type => mimeType.startsWith(type))) {
      return true
    }

    return false
  }

  render () {
    // Check if file is binary
    if (this.isBinary) {
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

export function file(name = "", content = "") {
  return new File({ path: name, content }).render()
}