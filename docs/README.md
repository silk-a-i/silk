# Silk Documentation

Silk is a CLI tool for quick task automation using LLMs (Language Learning Models). It provides a simple interface to interact with AI models for code generation and task automation.

## Quick Start

```bash
# Install globally
npm install -g https://github.com/silk-a-i/silk-cli.git

# Initialize a new project
silk init

# Run a single task
silk do "create a hello world program"

# Start interactive chat mode
silk chat
```

## Configuration

Silk can be configured using a `.silk/config.js` file in your project root.

Example config:
```js
export default {
  apiKey: "your-api-key",
  model: "silk/fast",
  root: "public",
  include: ["**/*"]
}
```

## Available Commands

- `silk init` - Initialize a new Silk project
- `silk do` - Execute a single task
- `silk ask` - Execute a single task without context
- `silk chat` - Start interactive chat mode
- `silk info` - Show current configuration
- `silk parse` - Parse markdown file into individual files
- `silk prep` - Create a package of files
- `silk pack` - Pack folder contents into a single markdown file
