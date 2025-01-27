import { gatherContextInfo } from '../lib/fs.js'
import { formatBytes } from '../lib/renderers/utils.js'
import { autoscope } from '../lib/scoping/autoscope.js'

export async function install(program, context) {
    program
        .command('autoscope')
        .alias('ascope')
        .argument('[prompt]', 'prompt or file')
        .description('Scope the context to a specific set of files')
        .action(scopeContext(context))
}

const scopeContext = ({ state, ui }) => async (prompt = "") => {
    const { config } = state

    const files = await gatherContextInfo(['**/*'], {
        ignore: config.ignore
    })

    const selectedFiles = await autoscope({ files, prompt, config })

    // Update the config's include option
    state.config.include = selectedFiles

    ui.info(`Context scoped to ${selectedFiles.length} files:`)
    selectedFiles.forEach(({ file, reason }) =>
        ui.info(`  - ${file.path} [${formatBytes(file.size)}] ${reason}`)
    )

    return selectedFiles
}
