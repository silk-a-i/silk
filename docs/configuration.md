# API Keys
For remote LLM tasks, you need to provide an API key to authenticate.

You can provide the API key in the following ways:
> Get your API key from https://console.silk-labs.com
```sh
silk login <api-key>
```

# Options reference

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `apiKey` | `string` | API key for remote LLM services | `null` |
| `model` | `string` | Default language model to use | `"gpt-3.5-turbo"` |
| `temperature` | `number` | Creativity/randomness of model responses | `0.0` |
| `maxTokens` | `number` | Maximum tokens in model response | `4000` |
| `timeout` | `number` | API request timeout in milliseconds | `30000` |

# Config file
Most of Silk's configuration is done through a `config.mjs` file.

Silk will look for this file in the following locations:

- Your home directory
- The folder called `.silk` in your project directory

> NOTE If the files above exist, they will be loaded in that order. Files loaded last will take priority.

You can also specify the `--config <filename>` parameter, which will only load the one config file.

# Config with .env
Use a `.env` file to store sensitive information like API keys.
Silk will look search for a `.env` file on these locations:

- Your home directory config at `~/.config/silk`
- The root of your project