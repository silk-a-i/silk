# Silk CLI Usage Guide 🚀

## Basic Commands

### Initialization
```bash
# Initialize a new project
silk init
```

### Task Execution

#### Single Task
```bash
# Run a single AI-powered task
silk run "Create a new React component"
```

#### Interactive Chat Mode
```bash
# Start an interactive AI assistant session
silk chat
```

#### Batch Processing
```bash
# Process multiple tasks from a file
silk each tasks.md
```

## Configuration

### API Key Setup
```bash
# Login with your API key
silk login <api-key>
```

### Configuration Options

| Option | Command | Description |
|--------|---------|-------------|
| `apiKey` | `silk login` | Set remote LLM service API key |
| `model` | `silk config model gpt-3.5-turbo` | Set default language model |
| `temperature` | `silk config temperature 0.5` | Set response creativity |

### Config File Locations
- `~/.config/silk/config.mjs`
- `.silk/config.mjs` in project root
- Custom config with `--config <filename>`

## File Management Tools

### Create Files
```bash
# Create a new file
silk create index.html
```

### Modify Files
```bash
# Modify an existing file
silk modify README.md
```

### Delete Files
```bash
# Remove a file
silk delete unused.txt
```

### Pack and Parse
```bash
# Pack project files into markdown
silk pack project.md

# Parse markdown back into files
silk parse project.md
```

## Advanced Usage

### Custom Tools
- Define custom tools in `config.mjs`
- Extend functionality with plugins

### Workflow Automation
- Use `silk each` for batch processing
- Create project templates
- Automate repetitive tasks

## Troubleshooting

- Ensure Node.js and npm are up to date
- Check network connectivity
- Verify API key and configuration

## Support

For issues or questions:
- [GitHub Issues](https://github.com/silk-a-i/silk/issues)
- [Documentation](https://docs.silk-labs.com)

*Generated with ❤️ by Silk AI Assistant*
