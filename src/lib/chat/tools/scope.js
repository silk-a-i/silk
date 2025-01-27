import inquirer from 'inquirer'
import { gatherContextInfo } from '../../fs.js'

export async function install(program, chatInstance) {
  program
    .command('scope')
    .description('Scope the context to a specific set of files')
    .action(scopeContext(chatInstance))
}

const scopeContext = (chatInstance) => async () => {
    const { state } = chatInstance

    // Gather all files in the project
    const files = await gatherContextInfo(['**/*'], { 
        ignore: [
            'node_modules/**', 
            '.git/**', 
            'dist/**', 
            'build/**',
            'src/**'
        ] 
    })

    // Transform files into choices for Inquirer
    const fileChoices = files.map(file => ({
        name: file.path,
        value: file.path,
        checked: state.config.include.includes(file.path)
    }))

    // Prompt user to select files for context
    const { selectedFiles } = await inquirer.prompt([
        {
            type: 'checkbox',
            name: 'selectedFiles',
            message: 'Select files to include in context:',
            choices: fileChoices,
            pageSize: 20
        }
    ])

    // Update the config's include option
    state.config.include = selectedFiles

    chatInstance.ui.info(`Context scoped to ${selectedFiles.length} files:`)
    selectedFiles.forEach(file => 
        chatInstance.ui.info(`  - ${file}`)
    )
}

// async function useFuzzy() {
//     const fuzzy = await import('inquirer-fuzzy-path')
//     inquirer.registerPrompt('fuzzypath', fuzzy.default)
//     const {file} = await inquirer.prompt([
//         {
//             type: 'fuzzypath',
//             name: 'file',
//             excludePath: nodePath => {
//                 // @todo grap from ignore list
//                 const ignoreList = ['node_modules', '.git', 'dist', 'build']
//                 return ignoreList.some(ignore => nodePath.startsWith(ignore))
//             },
//             message: 'Select a file',
//             rootPath: 'src',
//             pageSize: 10
//         }
//     ])
//     return [file]
// }
