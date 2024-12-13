import path from 'path';

export class File {
  constructor(filePath, content) {
    this.path = filePath;
    this.content = content;
  }

  render() {
    const ext = path.extname(this.path).slice(1) || 'txt';
    return `##### \`${this.path}\`
\`\`\`${ext}
${this.content.trim()}
\`\`\`
`;
  }
}
