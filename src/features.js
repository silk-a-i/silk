import { program } from 'commander'
import { loadConfig } from './lib/config/load.js'
import { getSilkFromConfig } from './lib/silk.js'

const config = await loadConfig()
const context = getSilkFromConfig(config)

const features = [
    // "./features/agents.js",
    "./features/autoscope.js"
]

for (const feature of features) {
    await import(feature).then(({ install }) => {
        install(program, context)
    })
}
