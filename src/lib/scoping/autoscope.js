import { generateJson } from "../silk.js"

export const createAutoscopeMessages = ({ prompt = '', verbose = false, files }) => {
    return [
        {
            role: 'system',
            content:
                `
Your name is 'Silk'. You are an agent that helps developers to scope their context to a specific set of files.
- Be brief and to the point.
- Don't respond with the answer to the intend.
- You are expert in picking the correct file or files regarding a intend.
- Respond with a JSON array.

# Example
${verbose ? `[
    ["file1", "reason", "importance"],
    ["file2", "reason", "importance"] 
]` : `[
    ["file1"],
    ["file2"] 
]`}
`
        },
        {
            role: 'user',
            content:
                `# Intend
${prompt} 

Select files to include in context: 
${files.map(file => file.path).join('\n')}
`
        }
    ]
}

export class AutoscopeFile {
    path = ""
    reason = ""
    importance = ""

    fromArray([path, reason, importance]) {
        this.path = path
        this.reason = reason
        this.importance = importance
    }
}

/**
 * Autoscope the context to a specific set of files
 * @param {*} param0 
 * @returns 
 */
export async function autoscope({ files = [], prompt = "", config }, { verbose = false } = {}) {
    const messages = createAutoscopeMessages({ prompt, verbose, files })

    const {json, text} = await generateJson({
        config,
        messages,
    })

    // Map back to File objects
    const selectedFiles = mapPathsToContext(json, files, {verbose})

    return selectedFiles
}

export function mapPathsToContext(paths = [], files = [], {verbose = false} = {}) {
    return paths
        .map(e => {
            return {
                file: files.find(f => f.path === e[0]),
                reason: verbose && e[1],
                importance: verbose && e[2]
            }
        })
}