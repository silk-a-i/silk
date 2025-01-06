import path from 'path'

export class File {
  path = ''
  size = 0
  content = ''

  constructor (obj = {}) {
    Object.assign(this, obj)
  }

  render () {
    const ext = path.extname(this.path).slice(1) || 'txt'
    return `##### \`${this.path}\`
\`\`\`${ext}
${this.content}
\`\`\`
`
  }
}
