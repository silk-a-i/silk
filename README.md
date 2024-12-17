# Silk CLI

Silk is a command-line tool that leverages Large Language Models (LLMs) to help you quickly solve various coding and automation tasks.

## Features

- 🚀 Quick task execution with natural language
- 💬 Interactive chat mode
- 📝 Process tasks from files
- 📤 Output to files
- 🔄 Support for multiple LLM providers
- 🎯 Focused on developer productivity

## Requirements

- Node.js 18+
- Ollama or other LLM provider

## Installation

```bash
# Install globally
npm install -g https://github.com/silk-a-i/silk-cli.git

# Or use directly with npx
npx silk-cli
```

## Configuration

Silk can be configured using environment variables or a `.silk.json` file:

```bash
# Environment variables
SILK_BASE_URL=http://localhost:11434/v1
SILK_API_KEY=your-api-key
SILK_MODEL=llama3.1
```

Or create a `.silk.json` file:

```json
{
  "baseUrl": "http://localhost:11434/v1",
  "model": "llama3.1",
  "apiKey": "your-api-key"
}
```

## Usage

```sh
# Do command
silk do ./my-project "create an app"
silk do ./my-project  # uses design.md

# Patch command
silk patch ./my-project "update styles"
silk patch ./my-project  # uses design.md

# Chat command
silk chat ./my-project  # all operations happen in project dir

# Map command
silk map ./my-project "convert to typescript" --context "**/*.js"
silk map ./my-project --context "**/*.js"  # uses design.md
```

### `silk chat`

Start interactive chat mode. Type `exit` to quit.

## Development

```bash
# Clone the repository
git clone https://github.com/silk-a-i/silk-cli

# Install dependencies
npm install

# Link for local development
npm link

# Run tests
npm test
```

## Roadmap

- [x] Iterate files the `map` command
- [x] Interactive chat mode
- [x] Support for remote LLM providers
- [ ] `Todo` mode
- [ ] Patch mode
- [ ] `Prepare` command for setting up tasks
- [ ] Browser support
- [ ] Incremental mode (continue stopped tasks)
- [ ] Server mode

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this in your own projects!
