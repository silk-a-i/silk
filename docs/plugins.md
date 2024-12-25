# Plugins

Silk supports plugins to extend its functionality. Plugins can add new tools, modify behavior, or add new commands.

## Creating a Plugin

```js
function myPlugin(settings = {}) {
  return {
    name: 'my-plugin',
    examples: `...`,
    setup(ctx, tools) {
      // Plugin setup code
      ctx.on("finish", async (res, tools) => {
        // Handle finish event
      })
    }
  }
}

// In .silk/config.js
export default {
  // ... other config
  plugins: [
    myPlugin({ /* settings */ })
  ]
}
```

## Built-in Plugins

### Inquirer Plugin
Adds interactive prompts.

```js
import { InquirerToolCreator } from 'silk/plugins/inquirer'

export default {
  additionalTools: [
    new InquirerToolCreator({
      // Plugin options
    })
  ]
}
```

