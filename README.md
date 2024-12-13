# Silk CLI

Silk is a command-line tool that leverages Large Language Models (LLMs) to help you quickly solve various coding and automation tasks.

## Features

- 🚀 Quick task execution with natural language
- 💬 Interactive chat mode
- 📝 Process tasks from files
- 📤 Output to files or clipboard
- 🔄 Support for multiple LLM providers
- 🎯 Focused on developer productivity

## Requirements

- Node.js 18+
- Ollama or other LLM provider

## Installation

```bash
# Install globally
npm install -g silk-cli

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

### Quick Tasks

Execute single tasks with natural language prompts:

```bash
# Generate content
silk create "1 jokes in json"
silk create "a hello world html page"
## Set output directory
silk create "a snake game" --output output/ 
## Add context 
silk create "a summary" --context "**/*.js"

# Patch
silk patch "update all console.log to use debug"

# Patch files in current directory
silk create "a hello world html page"
echo "Continue?"
read
silk patch "add a dark theme"
```

### Conversions
Run over each file a given prompt.
```bash
silk map "convert to vue" --context "**/*.jsx"
silk map "convert to vue3 using script setup" --context "**/*.jsx" -o src/
```

### Interactive mode

```bash
silk chat
> "3 jokes in json"
> "add 2 more jokes"
> exit
```

## Command Reference

Options for all commands:
- `-o, --output <dir>`: Output directory for generated files (default: "output")
- `-c, --context <glob>`: File glob pattern to process
- `-v, --verbose`: Adds additional information including the used prompt
- `-r, --raw`: Show raw LLM output without formatting

### `silk init`
Prompts the user for which model provider to use and creates a new silk project.

### `silk create <prompt>`

Execute a single task.

### `silk patch <prompt>`

Same as `do` command but defaults to:
- Output directory: Current directory (.)
- Context: All files (**/*)


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