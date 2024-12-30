# API Reference

## Core Classes

### CommandHandler
Main class for handling command execution.

```js
const handler = new CommandHandler(config);
await handler.execute("Create a new index.html file");
```

### Task
Represents a single task with prompt and context.

```js
const task = new Task({ 
  prompt: "Create index.html",
  context: [],
  tools: []
});
```

### Tool
Base class for creating custom tools.

```js
class CustomTool extends Tool {
  name = 'custom'
  description = 'Custom tool description'
  examples = '...'
  
  onFinish(action, ctx) {
    // Handle tool execution
  }
}
```

## Configuration

### Config Class
Handles loading and validating configuration.

```js
const config = new Config({
  apiKey: "your-api-key",
  model: "silk/fast",
  root: "public"
});
```

## Tools

Silk comes with basic file manipulation tools:

- `create` - Create new files
- `modify` - Modify existing files
- `delete` - Delete files

Custom tools can be added via plugins in the config file.
